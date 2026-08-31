import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';

/**
 * Query Key Constants
 */
export const PRODUCT_QUERY_KEYS = {
  all: ['products'],
  list: (filters) => ['products', { ...filters }],
  barcode: (code) => ['product', 'barcode', code],
  detail: (id) => ['product', 'detail', id],
};

/**
 * Hook to fetch products catalog with caching, search, and status filters
 */
export const useProducts = ({ search = '', filter = 'all', category = '' } = {}) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list({ search, filter, category }),
    queryFn: () => productService.getProducts({ search, filter, category }),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

/**
 * Hook to fetch a single product by Barcode (instant cached lookup for scanner)
 */
export const useProductByBarcode = (barcode, { enabled = true } = {}) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.barcode(barcode),
    queryFn: () => productService.getProductByBarcode(barcode),
    enabled: Boolean(barcode) && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for Creating a New Product with automatic cache invalidation
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProductData) => productService.createProduct(newProductData),
    onSuccess: (data) => {
      // Invalidate all product queries so catalog stays fresh
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      if (data?.barcode) {
        queryClient.setQueryData(PRODUCT_QUERY_KEYS.barcode(data.barcode), data);
      }
    },
  });
};

/**
 * Hook for Restocking Existing Product with cache update
 */
export const useRestockProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restockData) => productService.restockProduct(restockData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook for Updating Product specifications with cache invalidation
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      const item = updated?.data || updated;
      if (item?.id || item?._id) {
        queryClient.setQueryData(PRODUCT_QUERY_KEYS.detail(item.id || item._id), item);
      }
    },
  });
};

/**
 * Hook for Deleting a Product with cache purge
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => productService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });
};
