import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Edit, Save, X, Barcode, Tag, DollarSign, Package } from 'lucide-react';

const EditProductModal = ({ isOpen, product, onSave, onClose }) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('Pcs');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBarcode(product.barcode || '');
      setCategory(product.category || 'Grocery');
      setPurchasePrice(product.purchasePrice || '');
      setSellingPrice(product.sellingPrice || '');
      setStock(product.stock !== undefined ? product.stock : '');
      setUnit(product.unit || 'Pcs');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...product,
      name,
      barcode,
      category,
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stock: parseInt(stock, 10) || 0,
      unit,
    };
    onSave(updated);
  };

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Edit className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">{t('editProduct')}</h3>
            <p className="text-xs text-slate-500 font-semibold">Modify product specifications and stock details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barcode Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-700">
              {t('barcode')}
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-700">
              {t('productName')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Grocery">Grocery</option>
                <option value="Dairy">Dairy</option>
                <option value="Snacks">Snacks</option>
                <option value="Personal Care">Personal Care</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pcs">Pcs</option>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Packet">Packet</option>
                <option value="Pack">Pack</option>
              </select>
            </div>
          </div>

          {/* Purchase & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('purchasePrice')} (₹)
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-700">
                {t('sellingPrice')} (₹) *
              </label>
              <input
                type="number"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold uppercase text-slate-700">
              {t('stock')} {t('quantityToAdd')}
            </label>
            <input
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t('save')} {t('products')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProductModal;
