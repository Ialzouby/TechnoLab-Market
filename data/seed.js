'use strict';

/**
 * Demo content for the in-memory store. Loaded once at startup so every page
 * has something to show without a database behind it.
 *
 * The images below are the real product photos already in public/images:
 *   product1 - flexible cable organizer wrap
 *   product2 - articulated mini octopus set
 *   product3 - "The Hive" modular hex drawers
 *   product4 - Baby Groot figurine
 *   product5 - low-poly geometric succulent planter
 *   product6 - Poke Ball with display stand
 */

const bcrypt = require('bcrypt');

const User = require('../models/userModel');
const Item = require('../models/itemModel');
const Offer = require('../models/offerModel');
const Review = require('../models/reviewModel');
const { Oid } = require('./store');

// Every demo account uses this password.
const DEMO_PASSWORD = 'password123';

const userIds = {
  issam: new Oid(),
  maya: new Oid(),
  diego: new Oid(),
  priya: new Oid(),
};

const itemIds = {
  octopusSet: new Oid(),
  groot: new Oid(),
  hiveFull: new Oid(),
  planter: new Oid(),
  pokeball: new Oid(),
  cableWrap: new Oid(),
  hiveStarter: new Oid(),
  octopusJumbo: new Oid(),
  planterNylon: new Oid(),
};

const users = [
  { _id: userIds.issam, firstName: 'Issam', lastName: 'Alzouby', email: 'issam@technolab.com' },
  { _id: userIds.maya, firstName: 'Maya', lastName: 'Chen', email: 'maya@technolab.com' },
  { _id: userIds.diego, firstName: 'Diego', lastName: 'Ramirez', email: 'diego@technolab.com' },
  { _id: userIds.priya, firstName: 'Priya', lastName: 'Nair', email: 'priya@technolab.com' },
];

const items = [
  {
    _id: itemIds.octopusSet,
    title: 'Articulated Mini Octopus (Set of 4)',
    seller: userIds.maya,
    condition: 'New',
    category: 'PLA',
    price: 14.99,
    image: '/images/product2.png',
    details:
      'Set of four print-in-place articulated octopuses in purple, orange, olive and grey. '
      + 'Every tentacle segment moves straight off the build plate — no assembly, no supports. '
      + 'Printed at 0.12mm layer height in matte PLA, roughly 3 inches across.',
  },
  {
    _id: itemIds.groot,
    title: 'Baby Groot Desk Figurine',
    seller: userIds.issam,
    condition: 'Like-New',
    category: 'PLA',
    price: 24.5,
    image: '/images/product4.png',
    details:
      'Sitting Baby Groot printed in natural wood-fill PLA, then lightly sanded so the grain '
      + 'really reads. Stands about 5 inches tall. Displayed on a shelf for a couple of months, '
      + 'never handled much — one faint layer line on the back of the head is the only flaw.',
  },
  {
    _id: itemIds.hiveFull,
    title: 'The Hive - Modular Hex Drawers (20 Piece)',
    seller: userIds.diego,
    condition: 'New',
    category: 'PETG',
    price: 42.0,
    image: '/images/product3.png',
    details:
      'Twenty interlocking hexagonal drawers in orange and white PETG. They snap together in any '
      + 'arrangement and mount to a wall or sit on a desk. Perfect for resistors, screws, SD cards '
      + 'and all the small parts that end up loose in a drawer. Printed at 40% infill so the walls stay rigid.',
  },
  {
    _id: itemIds.planter,
    title: 'Low-Poly Geometric Succulent Planter',
    seller: userIds.priya,
    condition: 'New',
    category: 'PLA',
    price: 18.0,
    image: '/images/product5.png',
    details:
      'Faceted low-poly planter in a grey and white two-tone finish, printed vase-mode for clean '
      + 'unbroken walls. Sealed on the inside so it holds soil without weeping. Fits a 3 inch '
      + 'succulent or small cactus. Drainage hole included.',
  },
  {
    _id: itemIds.pokeball,
    title: 'Poke Ball with Display Stand',
    seller: userIds.maya,
    condition: 'Good',
    category: 'ABS',
    price: 21.75,
    image: '/images/product6.png',
    details:
      'Two-part Poke Ball that twists open, printed in ABS and acetone-smoothed to a glossy finish. '
      + 'Comes with the black three-prong display stand shown. About 3 inches in diameter. '
      + 'Some light scuffing on the red half from being opened and closed a lot.',
  },
  {
    _id: itemIds.cableWrap,
    title: 'Flexible Cable Organizer Wrap (3-Pack)',
    seller: userIds.issam,
    condition: 'New',
    category: 'TPU',
    price: 9.99,
    image: '/images/product1.png',
    details:
      'Three flexible TPU cable wraps that coil your charging cables into a tidy loop and keep them '
      + 'from tangling in a bag. Printed in 95A shore TPU so they stretch without cracking. '
      + 'Fits USB-C, Lightning and standard power cables up to 6 feet.',
  },
  {
    _id: itemIds.hiveStarter,
    title: 'The Hive Starter Pack (6 Drawers)',
    seller: userIds.diego,
    condition: 'Good',
    category: 'PETG',
    price: 16.5,
    image: '/images/product31.png',
    details:
      'A smaller six-drawer set from the same Hive system, in matching orange and white PETG. '
      + 'These came off an earlier print run so the seams are a little more visible, but they clip '
      + 'to the full set perfectly. Great way to try the system before committing to the big kit.',
  },
  {
    _id: itemIds.octopusJumbo,
    title: 'Articulated Octopus - Jumbo',
    seller: userIds.priya,
    condition: 'Fair',
    category: 'PLA',
    price: 11.0,
    image: '/images/product2.png',
    details:
      'Oversized version of the articulated octopus, about 7 inches across in olive green PLA. '
      + 'Two tentacle joints are stiff and one has a small crack near the body, so it is priced to move. '
      + 'Still a fun desk toy or a good candidate for a repair project.',
  },
  {
    _id: itemIds.planterNylon,
    title: 'Low-Poly Planter - Nylon Edition',
    seller: userIds.issam,
    condition: 'Like-New',
    category: 'Nylon',
    price: 27.0,
    image: '/images/product5.png',
    details:
      'Same faceted planter geometry printed in nylon instead of PLA, so it handles heat and outdoor '
      + 'sun without softening or going brittle. Noticeably tougher and a little more flexible than '
      + 'the PLA version. Used outdoors for one season and cleaned up since.',
  },
];

const offers = [
  { amount: 16.0, item: itemIds.octopusSet, buyer: userIds.issam, status: 'pending' },
  { amount: 45.0, item: itemIds.hiveFull, buyer: userIds.issam, status: 'pending' },
  { amount: 12.0, item: itemIds.octopusJumbo, buyer: userIds.issam, status: 'accepted' },
  { amount: 26.0, item: itemIds.groot, buyer: userIds.maya, status: 'pending' },
  { amount: 28.5, item: itemIds.groot, buyer: userIds.diego, status: 'pending' },
  { amount: 11.0, item: itemIds.cableWrap, buyer: userIds.priya, status: 'pending' },
  { amount: 29.0, item: itemIds.planterNylon, buyer: userIds.maya, status: 'pending' },
  { amount: 19.0, item: itemIds.planter, buyer: userIds.diego, status: 'pending' },
];

const reviews = [
  {
    reviewer: userIds.maya,
    reviewedUser: userIds.issam,
    rating: 5,
    comment: 'Groot arrived exactly as described and the wood-fill finish looks even better in person. Shipped same week.',
  },
  {
    reviewer: userIds.diego,
    reviewedUser: userIds.issam,
    rating: 4,
    comment: 'Good communication and fair pricing. Packaging could have used a bit more padding, but nothing was damaged.',
  },
  {
    reviewer: userIds.issam,
    reviewedUser: userIds.diego,
    rating: 5,
    comment: 'The Hive drawers snap together perfectly. Already ordered a second set for the lab bench.',
  },
  {
    reviewer: userIds.priya,
    reviewedUser: userIds.maya,
    rating: 5,
    comment: 'The octopus set is adorable and every joint moves freely. Great layer quality.',
  },
];

async function seed() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of users) {
    await User.create({ ...user, password });
  }

  for (const item of items) {
    await Item.create(item);
  }

  for (const offer of offers) {
    await Offer.create(offer);
  }

  for (const review of reviews) {
    await Review.create(review);
  }

  // An accepted offer closes its listing and rejects the competing bids, the
  // same way offerController does it at runtime.
  for (const accepted of await Offer.find({ status: 'accepted' })) {
    await Offer.updateMany({ item: accepted.item, _id: { $ne: accepted._id } }, { status: 'rejected' });
    await Item.findByIdAndUpdate(accepted.item, { active: false });
  }

  // Derive each listing's offer counters from the offers above.
  for (const item of await Item.find()) {
    const itemOffers = await Offer.find({ item: item._id });
    const highest = itemOffers.reduce((max, offer) => Math.max(max, offer.amount), 0);
    await Item.findByIdAndUpdate(item._id, { totalOffers: itemOffers.length, highestOffer: highest });
  }

  return { users: users.length, items: items.length, offers: offers.length, reviews: reviews.length };
}

module.exports = { seed, DEMO_PASSWORD, demoEmail: users[0].email };
