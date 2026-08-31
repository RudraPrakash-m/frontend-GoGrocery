import apiClient from '../../../services/api/apiClient';
import { INITIAL_PRODUCTS } from '../../../constants/mockProducts';
import { encryptPayload } from '../../../security/encryption/cryptoService';

// Local cache array to keep in-memory sync across tabs and fallbacks
let localProductsCache = [...INITIAL_PRODUCTS];

const normalizeUnit = (unit) => {
  if (!unit) return 'Pcs';
  const u = String(unit).trim();
  if (u.toLowerCase() === 'litre' || u.toLowerCase() === 'liter') return 'L';
  if (u.toLowerCase() === 'packet') return 'Pack';
  if (u.toLowerCase() === 'piece' || u.toLowerCase() === 'pieces') return 'Pcs';
  if (u.toLowerCase() === 'gram' || u.toLowerCase() === 'grams') return 'G';
  if (u.toLowerCase() === 'kg' || u.toLowerCase() === 'kilogram') return 'Kg';
  if (u.toLowerCase() === 'ml' || u.toLowerCase() === 'milliliter') return 'Ml';
  if (u.toLowerCase() === 'dozen') return 'Dozen';
  return u;
};

export const productService = {
  /**
   * Fetch all products from Backend API with optional search and filters
   * GET /api/products
   */
  getProducts: async ({ search = '', filter = 'all', category = '' } = {}) => {
    try {
      const response = await apiClient.get('/products', {
        params: { search, filter, category },
      });
      const data = response?.data?.data || response?.data || response;
      if (Array.isArray(data)) {
        localProductsCache = data;
        return data;
      }
    } catch (err) {
      console.warn('API /products failed or offline, using local memory state:', err?.message);
    }

    // Local fallback filter
    return localProductsCache.filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search) ||
        p.category?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter === 'lowStock') return p.stock <= (p.minStock || 5) && p.stock > 0;
      if (filter === 'outOfStock') return p.stock === 0;
      return true;
    });
  },

  /**
   * Find product by Barcode (Quick lookup for scanner & restock)
   * GET /api/products/barcode/:barcode
   */
  getProductByBarcode: async (barcode) => {
    if (!barcode) return null;
    const cleanCode = String(barcode).trim();

    try {
      const response = await apiClient.get(`/products/barcode/${encodeURIComponent(cleanCode)}`);
      const prod = response?.data?.data || response?.data || response;
      if (prod && (prod.name || prod._id || prod.id)) {
        return {
          id: prod._id || prod.id,
          ...prod,
        };
      }
    } catch (err) {
      // If 404 or backend route not implemented yet, check local cache
      console.warn(`Lookup /products/barcode/${cleanCode} fallback to local cache`);
    }

    return (
      localProductsCache.find((p) => String(p.barcode).trim() === cleanCode) || null
    );
  },

  /**
   * Quick Restock / Increment Stock for an Existing Product (AES-256 Encrypted Payload)
   * POST /api/products/restock
   * Payload: { barcode, productId, quantityAdded } -> Encrypted { iv, encryptedData }
   */
  restockProduct: async ({ barcode, productId, quantityAdded }) => {
    const qty = Number(quantityAdded) || 1;
    const payload = {
      barcode: barcode ? String(barcode).trim() : undefined,
      productId: productId || undefined,
      quantityAdded: qty,
    };

    // Encrypt payload with AES-256
    const encryptedPayload = encryptPayload(payload);
    const response = await apiClient.post('/products/restock', encryptedPayload);
    const itemData = response?.data?.data || response?.data || response;

    // Sync local cache
    localProductsCache = localProductsCache.map((p) => {
      if (
        (barcode && String(p.barcode).trim() === String(barcode).trim()) ||
        (productId && (p.id === productId || p._id === productId))
      ) {
        return {
          ...p,
          stock:
            itemData.currentStock !== undefined
              ? itemData.currentStock
              : (p.stock || 0) + qty,
        };
      }
      return p;
    });

    return response?.data || response;
  },

  /**
   * Create Brand New Product (AES-256 Encrypted Payload)
   * POST /api/products
   * Payload: { name, barcode, sellingPrice, purchasePrice, stock, category, unit, minStock } -> Encrypted { iv, encryptedData }
   */
  createProduct: async (productData) => {
    const payload = {
      name: productData.name.trim(),
      barcode: productData.barcode ? String(productData.barcode).trim() : undefined,
      sellingPrice: Number(productData.sellingPrice),
      purchasePrice: productData.purchasePrice ? Number(productData.purchasePrice) : 0,
      stock: Number(productData.stock) || 0,
      category: productData.category || 'Grocery',
      unit: normalizeUnit(productData.unit),
      minStock: productData.minStock ? Number(productData.minStock) : 5,
      isLoose: Boolean(productData.isLoose),
    };

    // Encrypt payload with AES-256
    const encryptedPayload = encryptPayload(payload);
    const response = await apiClient.post('/products', encryptedPayload);
    const item = response?.data?.data || response?.data || response;
    const formatted = {
      id: item._id || item.id || Date.now(),
      ...item,
    };

    localProductsCache = [formatted, ...localProductsCache];
    return {
      status: 'success',
      data: formatted,
      message: response?.message || 'Product created successfully',
    };
  },

  /**
   * Update Product (AES-256 Encrypted Payload)
   * PUT /api/products/:id
   */
  updateProduct: async (id, updatedData) => {
    const payload = {
      name: updatedData.name?.trim(),
      barcode: updatedData.barcode ? String(updatedData.barcode).trim() : undefined,
      sellingPrice: Number(updatedData.sellingPrice),
      purchasePrice:
        updatedData.purchasePrice !== undefined && updatedData.purchasePrice !== ''
          ? Number(updatedData.purchasePrice)
          : 0,
      stock: Number(updatedData.stock) || 0,
      category: updatedData.category || 'Grocery',
      unit: normalizeUnit(updatedData.unit),
      minStock:
        updatedData.minStock !== undefined && updatedData.minStock !== ''
          ? Number(updatedData.minStock)
          : 5,
      isLoose: Boolean(updatedData.isLoose),
    };

    const encryptedPayload = encryptPayload(payload);
    const response = await apiClient.put(`/products/${id}`, encryptedPayload);
    const updated = response?.data?.data || response?.data || response;

    const formatted = {
      id: updated._id || updated.id || id,
      ...updated,
    };

    localProductsCache = localProductsCache.map((p) =>
      p.id === id || p._id === id ? { ...p, ...formatted } : p
    );

    return {
      status: 'success',
      data: formatted,
      message: response?.message || 'Product updated successfully',
    };
  },

  /**
   * Delete Product
   * DELETE /api/products/:id
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    localProductsCache = localProductsCache.filter((p) => p.id !== id && p._id !== id);
    return response?.data || response;
  },
};

export default productService;
