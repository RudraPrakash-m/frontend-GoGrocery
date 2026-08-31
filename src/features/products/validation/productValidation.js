/**
 * Validation rules for Products & Inventory Management
 */

export const validateRestockQty = (quantity) => {
  if (quantity === undefined || quantity === null || String(quantity).trim() === '') {
    return 'Please enter a quantity to add';
  }
  const parsed = Number(quantity);
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return 'Quantity must be a positive whole number (at least 1)';
  }
  if (parsed > 100000) {
    return 'Quantity cannot exceed 100,000 units in a single batch';
  }
  return null;
};

export const validateProductName = (name) => {
  if (!name || !name.trim()) {
    return 'Product name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return 'Product name must be at least 2 characters';
  }
  if (trimmed.length > 150) {
    return 'Product name cannot exceed 150 characters';
  }
  return null;
};

export const validateSellingPrice = (price) => {
  if (price === undefined || price === null || String(price).trim() === '') {
    return 'Selling price is required';
  }
  const parsed = Number(price);
  if (isNaN(parsed) || parsed < 0) {
    return 'Selling price must be a valid positive number';
  }
  if (parsed > 1000000) {
    return 'Selling price exceeds maximum limit';
  }
  return null;
};

export const validatePurchasePrice = (purchasePrice, sellingPrice) => {
  if (purchasePrice === undefined || purchasePrice === null || String(purchasePrice).trim() === '') {
    return null; // Purchase price is optional
  }
  const parsedPurchase = Number(purchasePrice);
  if (isNaN(parsedPurchase) || parsedPurchase < 0) {
    return 'Purchase price must be a valid positive number';
  }
  if (sellingPrice !== undefined && sellingPrice !== null && String(sellingPrice).trim() !== '') {
    const parsedSelling = Number(sellingPrice);
    if (!isNaN(parsedSelling) && parsedPurchase > parsedSelling) {
      return 'Warning: Purchase price is higher than Selling price (selling at a loss)';
    }
  }
  return null;
};

export const validateInitialStock = (stock) => {
  if (stock === undefined || stock === null || String(stock).trim() === '') {
    return 'Initial stock quantity is required';
  }
  const parsed = Number(stock);
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return 'Stock must be 0 or a positive whole number';
  }
  if (parsed > 1000000) {
    return 'Stock exceeds maximum allowed value';
  }
  return null;
};

export const validateBarcode = (barcode) => {
  if (!barcode || !String(barcode).trim()) {
    return null; // Barcode can be auto-generated if omitted
  }
  const clean = String(barcode).trim();
  if (clean.length < 3 || clean.length > 32) {
    return 'Barcode must be between 3 and 32 characters';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
    return 'Barcode can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
};

export const ALLOWED_UNITS = ['Pcs', 'Kg', 'G', 'L', 'Ml', 'Pack', 'Dozen'];

export const validateUnit = (unit) => {
  if (!unit || !String(unit).trim()) {
    return 'Unit is required';
  }
  if (!ALLOWED_UNITS.includes(unit)) {
    return `Invalid unit. Allowed values: ${ALLOWED_UNITS.join(', ')}`;
  }
  return null;
};

export const validateNewProductForm = ({
  name,
  sellingPrice,
  purchasePrice,
  stock,
  category,
  unit,
  barcode,
}) => {
  const errors = {};

  const nameErr = validateProductName(name);
  if (nameErr) errors.name = nameErr;

  const priceErr = validateSellingPrice(sellingPrice);
  if (priceErr) errors.sellingPrice = priceErr;

  const costErr = validatePurchasePrice(purchasePrice, sellingPrice);
  if (costErr && !costErr.startsWith('Warning')) errors.purchasePrice = costErr;

  const stockErr = validateInitialStock(stock);
  if (stockErr) errors.stock = stockErr;

  if (!category || !String(category).trim()) {
    errors.category = 'Category is required';
  }

  const unitErr = validateUnit(unit);
  if (unitErr) errors.unit = unitErr;

  const barcodeErr = validateBarcode(barcode);
  if (barcodeErr) errors.barcode = barcodeErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
