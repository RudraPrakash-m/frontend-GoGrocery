import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Package, Edit, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { productService } from '../services/productService';
import ProductSearchBar from '../components/ProductSearchBar';
import EditProductModal from '../components/EditProductModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

const ProductsPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n?.language === 'or';
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingEditProduct, setPendingEditProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error(
        isOdia ? 'ଉତ୍ପାଦ ତାଲିକା ଲୋଡ୍ କରିବାରେ ତ୍ରୁଟି ଘଟିଲା' : 'Failed to load product catalog'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search) ||
      p.category?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    const min = p.minStock !== undefined ? p.minStock : 5;
    if (filter === 'lowStock') return p.stock <= min && p.stock > 0;
    if (filter === 'outOfStock') return p.stock === 0;
    return true;
  });

  const counts = {
    all: products.length,
    lowStock: products.filter((p) => p.stock <= (p.minStock || 5) && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  // Called when user clicks "Save Product" inside EditProductModal -> triggers ConfirmModal
  const handleEditModalSave = (updatedProduct) => {
    setEditingProduct(null);
    setPendingEditProduct(updatedProduct);
  };

  // Called when user confirms save inside ConfirmModal -> sends AES-256 encrypted PUT /api/products/:id
  const handleConfirmEditSave = async () => {
    if (!pendingEditProduct) return;
    const prodId = pendingEditProduct.id || pendingEditProduct._id;
    setActionLoading(true);

    try {
      const res = await productService.updateProduct(prodId, pendingEditProduct);
      const updated = res?.data || pendingEditProduct;

      setProducts((prev) =>
        prev.map((p) => (p.id === prodId || p._id === prodId ? { ...p, ...updated } : p))
      );
      setPendingEditProduct(null);

      if (isOdia) {
        toast.success(`ଉତ୍ପାଦ "${updated.name || pendingEditProduct.name}" ସଫଳତାର ସହିତ ଅଦ୍ୟତନ ହେଲା!`);
      } else {
        toast.success(
          res?.message || `Product "${updated.name || pendingEditProduct.name}" updated successfully!`
        );
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        (isOdia ? 'ଉତ୍ପାଦ ଅଦ୍ୟତନ କରିବାରେ ତ୍ରୁଟି ଘଟିଲା' : 'Failed to update product');
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Called when user confirms delete inside ConfirmModal -> sends DELETE /api/products/:id
  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    setActionLoading(true);

    try {
      await productService.deleteProduct(deletingProductId);
      setProducts((prev) =>
        prev.filter((p) => p.id !== deletingProductId && p._id !== deletingProductId)
      );
      setDeletingProductId(null);

      if (isOdia) {
        toast.success('ଉତ୍ପାଦ କାଟାଲଗ୍ ରୁ ଡିଲିଟ୍ ହେଲା।');
      } else {
        toast.success(t('productDeletedSuccess') || 'Product deleted from catalog.');
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        (isOdia ? 'ଉତ୍ପାଦ ଡିଲିଟ୍ କରିବାରେ ତ୍ରୁଟି ଘଟିଲା' : 'Failed to delete product');
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title & Top Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('products') || 'Products & Inventory'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isOdia
              ? `ମୋଟ ${products.length} ଟି ଉତ୍ପାଦ ତାଲିକାଭୁକ୍ତ`
              : `${t('total') || 'Total'} ${products.length} ${t('products') || 'Products listed'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/inventory/add')}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addStock') || 'Add / Restock'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar Component */}
        <ProductSearchBar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          counts={counts}
        />

        {/* Product Table */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`bg-slate-50 border-b border-slate-100 uppercase tracking-wider ${
                isOdia
                  ? 'text-xs sm:text-sm font-black text-slate-700'
                  : 'text-[11px] sm:text-xs font-extrabold text-slate-500'
              }`}
            >
              <tr>
                <th className="py-3.5 px-4">{t('productName') || 'Product Name'}</th>
                <th className="py-3.5 px-4">{t('category') || 'Category'}</th>
                <th className="py-3.5 px-4">{t('sellingPrice') || 'Selling Price'}</th>
                <th className="py-3.5 px-4">{t('stock') || 'Current Stock'}</th>
                <th className="py-3.5 px-4 text-right">{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                      <p className="text-xs font-bold text-slate-600">
                        {isOdia ? 'ଉତ୍ପାଦ ତାଲିକା ଲୋଡ୍ ହେଉଛି...' : 'Loading product catalog...'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="font-extrabold text-slate-700 text-sm mt-1">
                        {t('noProductsFound') || 'No Products Found'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {search
                          ? `No matches found for "${search}". Try searching with another keyword or barcode.`
                          : 'No items in this category yet. Click "Add / Restock" to register products.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const prodId = p.id || p._id;
                  const isLow = p.stock <= (p.minStock || 5) && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={prodId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Package className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{p.name}</p>
                            <p className="font-mono text-[10px] text-slate-400 tracking-wider">
                              {p.barcode || 'NO-BARCODE'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200/60">
                          {p.category || 'Grocery'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{p.sellingPrice}
                        {p.purchasePrice !== undefined && p.purchasePrice > 0 && (
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Cost: ₹{p.purchasePrice}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-extrabold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          {p.stock} {p.unit || 'Pcs'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                            title={t('edit') || 'Edit Product'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(prodId)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                            title={t('delete') || 'Delete Product'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PRODUCT MODAL */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        onSave={handleEditModalSave}
        onClose={() => setEditingProduct(null)}
      />

      {/* REUSABLE CONFIRM EDIT POPUP MODAL */}
      <ConfirmModal
        isOpen={Boolean(pendingEditProduct)}
        title={t('confirmEditTitle') || 'Update Product Details'}
        message={
          isOdia
            ? `ଆପଣ "${pendingEditProduct?.name}" ର ବିବରଣୀ ସେଭ୍ କରିବାକୁ ନିଶ୍ଚିତ କି?`
            : t('confirmEditMessage') || 'Are you sure you want to save changes to this product?'
        }
        variant="info"
        confirmText={actionLoading ? 'Saving...' : t('save') || 'Save'}
        cancelText={t('cancel') || 'Cancel'}
        onConfirm={handleConfirmEditSave}
        onCancel={() => setPendingEditProduct(null)}
      />

      {/* REUSABLE CONFIRM DELETE POPUP MODAL */}
      <ConfirmModal
        isOpen={Boolean(deletingProductId)}
        title={t('confirmDeleteTitle') || 'Delete Product'}
        message={
          isOdia
            ? 'ଆପଣ ଏହି ଉତ୍ପାଦଟିକୁ ଦୋକାନ କାଟାଲଗ୍ ରୁ ଡିଲିଟ୍ କରିବାକୁ ନିଶ୍ଚିତ କି?'
            : t('confirmDeleteMessage') ||
              'Are you sure you want to delete this product from catalog?'
        }
        variant="danger"
        confirmText={actionLoading ? 'Deleting...' : t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProductId(null)}
      />
    </div>
  );
};

export default ProductsPage;
