'use strict';

/**
 * A tiny in-memory data store that mimics the slice of the Mongoose API this
 * app actually uses. Everything lives in process memory, so the app needs no
 * database to run — handy for demos. Data resets every time the server
 * restarts.
 */

const crypto = require('crypto');

const models = {};

// ---------------------------------------------------------------------------
// Ids
// ---------------------------------------------------------------------------

class Oid {
  constructor(value) {
    this.value = value ? String(value) : crypto.randomBytes(12).toString('hex');
  }
  toString() { return this.value; }
  toJSON() { return this.value; }
  equals(other) { return other != null && idOf(other) === this.value; }
}

// Pulls a plain string id out of an Oid, a document, or an id-like string.
function idOf(value) {
  if (value == null) return null;
  if (value instanceof Oid) return value.value;
  if (typeof value === 'object') return value._id != null ? idOf(value._id) : null;
  return String(value);
}

function isValidId(value) {
  return /^[a-f0-9]{24}$/i.test(idOf(value) || '');
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

class Doc {
  constructor(model, data) {
    Object.defineProperty(this, '$model', { value: model, enumerable: false });
    Object.assign(this, data);
  }
  get id() { return this._id.value; }
  equals(other) { return this._id.equals(other); }
  save() { return this.$model.$write(this); }
}

// ---------------------------------------------------------------------------
// Filtering, sorting, updating
// ---------------------------------------------------------------------------

function valuesMatch(value, target) {
  if (value instanceof Oid || target instanceof Oid || target instanceof Doc) {
    return idOf(value) === idOf(target);
  }
  return value === target;
}

function fieldMatches(value, condition) {
  const isOperatorObject =
    condition !== null &&
    typeof condition === 'object' &&
    !(condition instanceof Oid) &&
    !(condition instanceof Doc) &&
    !(condition instanceof Date) &&
    Object.keys(condition).some((key) => key.startsWith('$'));

  if (!isOperatorObject) return valuesMatch(value, condition);

  return Object.entries(condition).every(([operator, operand]) => {
    switch (operator) {
      case '$ne': return !valuesMatch(value, operand);
      case '$in': return operand.some((entry) => valuesMatch(value, entry));
      case '$nin': return !operand.some((entry) => valuesMatch(value, entry));
      case '$regex': return new RegExp(operand, condition.$options || '').test(String(value ?? ''));
      case '$options': return true; // consumed by $regex
      case '$gt': return value > operand;
      case '$gte': return value >= operand;
      case '$lt': return value < operand;
      case '$lte': return value <= operand;
      default: return false;
    }
  });
}

function matches(row, filter) {
  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$and') return condition.every((sub) => matches(row, sub));
    if (key === '$or') return condition.some((sub) => matches(row, sub));
    if (key === '$nor') return !condition.some((sub) => matches(row, sub));
    return fieldMatches(row[key], condition);
  });
}

function compare(a, b) {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) return a - b;
  if (typeof a === 'boolean' || typeof b === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function sortDocs(docs, spec) {
  const criteria = Object.entries(spec);
  return docs.sort((a, b) => {
    for (const [field, direction] of criteria) {
      const result = compare(a[field], b[field]);
      if (result !== 0) return result * (direction < 0 ? -1 : 1);
    }
    return 0;
  });
}

function applyUpdate(row, update) {
  for (const [key, value] of Object.entries(update)) {
    if (key === '$set') {
      Object.assign(row, value);
    } else if (key === '$inc') {
      for (const [field, amount] of Object.entries(value)) {
        row[field] = (row[field] || 0) + amount;
      }
    } else if (key === '$max') {
      for (const [field, candidate] of Object.entries(value)) {
        row[field] = Math.max(row[field] || 0, Number(candidate));
      }
    } else if (key === '$min') {
      for (const [field, candidate] of Object.entries(value)) {
        row[field] = Math.min(row[field] ?? Infinity, Number(candidate));
      }
    } else {
      row[key] = value;
    }
  }
}

// ---------------------------------------------------------------------------
// Queries — thenable, so `await Model.find(...)` works like Mongoose
// ---------------------------------------------------------------------------

class Query {
  constructor(model, run, { single = false, count = false } = {}) {
    this.model = model;
    this.run = run;
    this.single = single;
    this.count = count;
    this.sortSpec = null;
    this.populations = [];
  }

  sort(spec) { this.sortSpec = spec; return this; }

  populate(path) { this.populations.push(path); return this; }

  async exec() {
    let docs = this.run();
    if (this.sortSpec) sortDocs(docs, this.sortSpec);
    if (this.count) return docs.length;

    if (this.single) docs = docs.slice(0, 1);

    for (const path of this.populations) {
      const target = models[this.model.refs[path]];
      if (!target) continue;
      for (const doc of docs) {
        doc[path] = doc[path] == null ? null : target.hydrate(target.rows.get(idOf(doc[path])));
      }
    }

    return this.single ? docs[0] || null : docs;
  }

  then(onFulfilled, onRejected) { return this.exec().then(onFulfilled, onRejected); }
  catch(onRejected) { return this.exec().catch(onRejected); }
  finally(onFinally) { return this.exec().finally(onFinally); }
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

class Model {
  constructor(name, spec = {}) {
    this.modelName = name;
    this.defaults = spec.defaults || {};
    this.refs = spec.refs || {};
    this.numbers = spec.numbers || [];
    this.required = spec.required || [];
    this.enums = spec.enums || {};
    this.rows = new Map();

    // Mirrors `Model.schema.path('field').enumValues`, used to build form menus.
    this.schema = { path: (field) => ({ enumValues: this.enums[field] || [] }) };
  }

  hydrate(row) {
    return row ? new Doc(this, { ...row }) : null;
  }

  normalize(source) {
    const row = { ...source };
    row._id = source._id instanceof Oid ? source._id : new Oid(source._id);

    for (const field of Object.keys(this.refs)) {
      if (row[field] != null) row[field] = new Oid(idOf(row[field]));
    }
    for (const field of this.numbers) {
      if (row[field] != null && row[field] !== '') row[field] = Number(row[field]);
    }
    return row;
  }

  validate(row) {
    const errors = [];

    for (const field of this.required) {
      const value = row[field];
      const missing =
        value == null ||
        value === '' ||
        (typeof value === 'number' && Number.isNaN(value));
      if (missing) errors.push(`${field} is required`);
    }

    for (const [field, allowed] of Object.entries(this.enums)) {
      if (row[field] != null && !allowed.includes(row[field])) {
        errors.push(`\`${row[field]}\` is not a valid value for \`${field}\``);
      }
    }

    if (errors.length) {
      const error = new Error(`${this.modelName} validation failed: ${errors.join(', ')}`);
      error.name = 'ValidationError';
      throw error;
    }
  }

  resolveDefaults() {
    const defaults = {};
    for (const [field, value] of Object.entries(this.defaults)) {
      defaults[field] = typeof value === 'function' ? value() : value;
    }
    return defaults;
  }

  // `new Model({...})` — builds an unsaved document, persisted by .save()
  build(data) {
    return this.hydrate(this.normalize({ ...this.resolveDefaults(), ...data }));
  }

  async create(data) {
    const row = this.normalize({ ...this.resolveDefaults(), ...data });
    this.validate(row);
    this.rows.set(row._id.value, row);
    return this.hydrate(row);
  }

  // Used by Doc#save()
  async $write(doc) {
    const row = this.normalize(doc);
    this.validate(row);
    this.rows.set(row._id.value, row);
    return doc;
  }

  find(filter = {}) {
    return new Query(this, () =>
      [...this.rows.values()].filter((row) => matches(row, filter)).map((row) => this.hydrate(row)));
  }

  findOne(filter = {}) {
    return new Query(this, () =>
      [...this.rows.values()].filter((row) => matches(row, filter)).map((row) => this.hydrate(row)),
    { single: true });
  }

  findById(id) {
    return new Query(this, () => {
      const row = this.rows.get(idOf(id));
      return row ? [this.hydrate(row)] : [];
    }, { single: true });
  }

  countDocuments(filter = {}) {
    return new Query(this, () =>
      [...this.rows.values()].filter((row) => matches(row, filter)), { count: true });
  }

  async findByIdAndUpdate(id, update) {
    const row = this.rows.get(idOf(id));
    if (!row) return null;
    applyUpdate(row, update);
    return this.hydrate(row);
  }

  async findByIdAndDelete(id) {
    const row = this.rows.get(idOf(id));
    if (!row) return null;
    this.rows.delete(idOf(id));
    return this.hydrate(row);
  }

  async updateMany(filter, update) {
    let modified = 0;
    for (const row of this.rows.values()) {
      if (matches(row, filter)) {
        applyUpdate(row, update);
        modified += 1;
      }
    }
    return { modifiedCount: modified };
  }

  async deleteMany(filter = {}) {
    let deleted = 0;
    for (const [id, row] of [...this.rows.entries()]) {
      if (matches(row, filter)) {
        this.rows.delete(id);
        deleted += 1;
      }
    }
    return { deletedCount: deleted };
  }

  clear() { this.rows.clear(); }
}

/**
 * Models are exported as a function so both Mongoose call styles work:
 * `Item.find(...)` for queries and `new Item({...})` for a fresh document.
 * The function delegates to the Model instance sitting on its prototype chain,
 * so every query method and the shared row Map are reachable from either one.
 */
function defineModel(name, spec) {
  const model = new Model(name, spec);

  const ModelRef = function (data) { return model.build(data); };
  Object.setPrototypeOf(ModelRef, model);

  models[name] = ModelRef;
  return ModelRef;
}

module.exports = { defineModel, models, Oid, Doc, idOf, isValidId };
