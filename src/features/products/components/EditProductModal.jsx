import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Edit, Save, X, Barcode, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { validateNewProductForm } from '../validation/productValidation';

const EditProductModal = ({ isOpen, product, onSave, onClose }) => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n?.language === 'or';

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [minStock, setMinStock] = useState('5');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBarcode(product.barcode || '');
      setCategory(product.category || 'Grocery');
      setPurchasePrice(
        product.purchasePrice !== undefined && product.purchasePrice !== null
          ? String(product.purchasePrice)
          : ''
      );
      setSellingPrice(
        product.sellingPrice !== undefined && product.sellingPrice !== null
          ? String(product.sellingPrice)
          : ''
      );
      setStock(product.stock !== undefined && product.stock !== null ? String(product.stock) : '');
      setUnit(product.unit || 'Pcs');
      setMinStock(
        product.minStock !== undefined && product.minStock !== null
          ? String(product.minStock)
          : '5'
      );
      setErrors({});
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formValues = {
      name,
      sellingPrice,
      purchasePrice,
      stock,
      category,
      unit,
      barcode,
    };

    // Client-side validation
    const validation = validateNewProductForm(formValues);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErr = Object.values(validation.errors)[0];
      toast.error(firstErr);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const updated = {
        ...product,
        id: product.id || product._id,
        _id: product._id || product.id,
        name: name.trim(),
        barcode: barcode ? barcode.trim() : undefined,
        category,
        purchasePrice: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock, 10) || 0,
        unit,
        minStock: parseInt(minStock, 10) || 5,
      };

      await onSave(updated);
    } catch (err) {
      console.error('Error submitting edit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('editProduct') || 'Edit Product'}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn">
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Edit className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">{t('editProduct') || 'Edit Product'}</h3>
            <p className="text-xs text-slate-500 font-semibold">
              {isOdia
                ? 'ଉତ୍ପାଦ ବିବରଣୀ ଏବଂ ଷ୍ଟକ୍ ସମ୍ପାଦନା କରନ୍ତୁ'
                : 'Modify product specifications and stock details'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Barcode Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-700">
              {t('barcode') || 'Barcode'}
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                disabled={submitting}
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value);
                  if (errors.barcode) setErrors((prev) => ({ ...prev, barcode: null }));
                }}
                className={`w-full pl-10 pr-3 py-3 bg-slate-50 border rounded-2xl text-slate-900 font-mono font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white disabled:opacity-60 transition-all ${
                  errors.barcode
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.barcode && (
              <p className="text-xs font-bold text-rose-500 pl-1">{errors.barcode}</p>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-700">
              {t('productName') || 'Product Name'} *
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white disabled:opacity-60 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                  : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.name && <p className="text-xs font-bold text-rose-500 pl-1">{errors.name}</p>}
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('category') || 'Category'} *
              </label>
              <select
                value={category}
                disabled={submitting}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="Grocery">Grocery</option>
                <option value="Dairy">Dairy</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household">Household</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('unit') || 'Unit'} *
              </label>
              <select
                value={unit}
                disabled={submitting}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="Pcs">Pcs (Piece)</option>
                <option value="Kg">Kg (Kilogram)</option>
                <option value="G">G (Gram)</option>
                <option value="L">L (Litre)</option>
                <option value="Ml">Ml (Millilitre)</option>
                <option value="Pack">Pack (Packet)</option>
                <option value="Dozen">Dozen</option>
              </select>
            </div>
          </div>

          {/* Purchase & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('purchasePrice') || 'Cost Price'} (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={submitting}
                value={purchasePrice}
                onChange={(e) => {
                  setPurchasePrice(e.target.value);
                  if (errors.purchasePrice)
                    setErrors((prev) => ({ ...prev, purchasePrice: null }));
                }}
                className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  errors.purchasePrice
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.purchasePrice && (
                <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.purchasePrice}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('sellingPrice') || 'Selling Price'} (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                disabled={submitting}
                value={sellingPrice}
                onChange={(e) => {
                  setSellingPrice(e.target.value);
                  if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: null }));
                }}
                className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  errors.sellingPrice
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.sellingPrice && (
                <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.sellingPrice}</p>
              )}
            </div>
          </div>

          {/* Stock Quantity & Min Stock Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('stock') || 'Stock'} ({unit}) *
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={submitting}
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: null }));
                }}
                className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-black text-base focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  errors.stock
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.stock && (
                <p className="text-xs font-bold text-rose-500 pl-1">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('minStock') || 'Low Stock Alert'} ({unit})
              </label>
              <input
                type="number"
                min="0"
                disabled={submitting}
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="5"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer transition-colors disabled:opacity-50"
            >
              {t('cancel') || 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isOdia ? 'ସେଭ୍ ହେଉଛି...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isOdia ? 'ଉତ୍ପାଦ ସେଭ୍ କରନ୍ତୁ' : (t('saveProduct') || 'Save Product')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProductModal;
