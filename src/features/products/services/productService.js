import { INITIAL_PRODUCTS } from '../../../constants/mockProducts';

export const productService = {
  getProducts: () => INITIAL_PRODUCTS,
  getProductByBarcode: (barcode) => {
    if (!barcode) return null;
    const cleanCode = String(barcode).trim();
    return INITIAL_PRODUCTS.find((p) => String(p.barcode).trim() === cleanCode) || null;
  },
};
