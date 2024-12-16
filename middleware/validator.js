// validator.js
function validateNewItem(req, res, next) {
  console.log('Form Data Received:', req.body);  // Add this line to debug
  console.log('File Received:', req.file);       // Add this to check file upload
  
  const { title, condition, price, details } = req.body;
  
  const safeRedirect = () => {
      const fallbackUrl = '/items/new';
      const redirectUrl = req.get('Referrer') || fallbackUrl;
      res.redirect(redirectUrl);
  };

  const errors = [];

  // More specific validation
  if (!title?.trim()) errors.push('Title is required');
  if (!condition) errors.push('Condition is required');
  if (!details?.trim()) errors.push('Details are required');
  
  // Better price validation
  const numPrice = parseFloat(price);
  if (!price || isNaN(numPrice) || numPrice <= 0) {
      errors.push('Price must be a valid number greater than 0');
  }
  
  if (errors.length > 0) {
      console.log('Validation errors:', errors);  // Add this line to debug
      req.flash('error', errors);
      return safeRedirect();
  }
  
  next();
}

function validateOffer(req, res, next) {
    const amount = parseFloat(req.body.amount);
    if (!amount || amount < 0.01) {
        req.flash('error', 'Offer amount must be at least $0.01.');
        return res.redirect('back');
    }
    next();
}

module.exports = { validateNewItem, validateOffer };
