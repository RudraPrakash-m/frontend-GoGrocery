import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Scan,
  PlusCircle,
  Search,
  CheckCircle,
  Package,
  ArrowLeft,
  X,
  Printer,
  Sparkles,
  Barcode,
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../../constants/mockProducts';

const AddStockPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n.language === 'or';

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scanExisting', 'createProductModal'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Search Existing Product for Quick Restock
  const [searchQuery, setSearchQuery] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(10);
  const [stockUpdateSuccess, setStockUpdateSuccess] = useState(null);

  // Create Barcode & Add New Product State
  const [generatedBarcode, setGeneratedBarcode] = useState(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [initialQty, setInitialQty] = useState('10');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Quick Restock Logic
  const handleSelectProductToRestock = (product) => {
    setFoundProduct(product);
    setQuantityToAdd(10);
  };

  const handleUpdateStockSubmit = (e) => {
    e.preventDefault();
    if (!foundProduct) return;

    const addedAmount = parseInt(quantityToAdd, 10) || 0;
    const prevStock = foundProduct.stock;
    const newStockAmount = prevStock + addedAmount;

    setProducts((prev) =>
      prev.map((p) => (p.id === foundProduct.id ? { ...p, stock: newStockAmount } : p))
    );

    setStockUpdateSuccess({
      productName: foundProduct.name,
      previousStock: prevStock,
      added: addedAmount,
      newStock: newStockAmount,
    });
    toast.success(t('stockUpdated'));

    setFoundProduct(null);
    setTimeout(() => {
      setStockUpdateSuccess(null);
    }, 2500);
  };

  // Generates unique 13-digit EAN barcode
  const handleGenerateBarcode = () => {
    const uniqueCode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setGeneratedBarcode(uniqueCode);
    toast.info(`${t('generatedBarcodeInfo')}: ${uniqueCode}`);
  };

  const handleSaveGeneratedProduct = () => {
    const codeToSave = generatedBarcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const nameToSave = productName || (isOdia ? 'ନୂଆ ଉତ୍ପାଦ' : 'New Product');

    const newProd = {
      id: Date.now(),
      name: nameToSave,
      barcode: codeToSave,
      category,
      purchasePrice: parseFloat(purchasePrice) || 20,
      sellingPrice: parseFloat(sellingPrice) || 30,
      unit,
      stock: parseInt(initialQty, 10) || 10,
      minStock: 5,
    };

    setProducts((prev) => [newProd, ...prev]);
    setCreateSuccess(true);

    toast.success(t('productSavedSuccess'));

    setTimeout(() => {
      setCreateSuccess(false);
      setActiveTab('menu');
      setGeneratedBarcode(null);
      setProductName('');
      setSellingPrice('');
      setPurchasePrice('');
    }, 2000);
  };

  const searchFilteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 relative pb-20">
      {/* Title */}
      <div className="pt-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('addStock')}
        </h1>
      </div>

      {/* Stock Update Toast Success Banner */}
      {stockUpdateSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('stockUpdated')}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {stockUpdateSuccess.productName}: {t('previousStock')} <strong>{stockUpdateSuccess.previousStock}</strong> → {t('added')} <strong className="text-emerald-700">+{stockUpdateSuccess.added}</strong> → {t('newStock')} <strong>{stockUpdateSuccess.newStock}</strong>
          </p>
        </div>
      )}

      {/* TWO HERO INVENTORY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Restock Existing Stock */}
        <button
          type="button"
          onClick={() => setActiveTab('scanExisting')}
          className="bg-white border-2 border-slate-200/90 hover:border-emerald-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4 group cursor-pointer"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <Scan className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
              {t('quickRestockTitle')}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {t('quickRestockSubtitle')}
            </p>
          </div>
        </button>

        {/* Card 2: Create Barcode & Add New Product */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('createProductModal');
            handleGenerateBarcode();
          }}
          className="bg-emerald-600 hover:bg-emerald-700 rounded-3xl p-6 shadow-md shadow-emerald-600/20 transition-all text-left flex flex-col justify-between space-y-4 group cursor-pointer text-white"
        >
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-xs group-hover:scale-105 transition-transform border border-white/30">
            <PlusCircle className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              {t('createProductTitle')}
            </h3>
            <p className="text-xs text-emerald-100 font-medium mt-1">
              {t('createProductSubtitle')}
            </p>
          </div>
        </button>
      </div>

      {/* QUICK RESTOCK SEARCH & SELECTION MODAL PORTAL */}
      {activeTab === 'scanExisting' &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('menu');
                  setFoundProduct(null);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Scan className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{t('quickRestockTitle')}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{t('searchByNameOrBarcode')}</p>
                </div>
              </div>

              {!foundProduct ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                    {searchFilteredProducts.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProductToRestock(prod)}
                        className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{prod.name}</p>
                          <p className="text-xs text-slate-500 font-semibold">
                            {t('barcode')}: {prod.barcode}
                          </p>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {t('stock')}: {prod.stock} {prod.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateStockSubmit} className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{foundProduct.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{t('barcode')}: {foundProduct.barcode}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-md">
                        {t('currentStock')}: {foundProduct.stock} {foundProduct.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                      {t('quantityToAdd')} ({foundProduct.unit})
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black text-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFoundProduct(null)}
                      className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer"
                    >
                      {t('cancel')}
                    </button>

                    <button
                      type="submit"
                      className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer"
                    >
                      {t('save')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* CREATE BARCODE & ADD NEW PRODUCT MODAL PORTAL */}
      {activeTab === 'createProductModal' &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn">
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{t('createProductTitle')}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{t('createProductSubtitle')}</p>
                </div>
              </div>

              {createSuccess ? (
                <div className="text-center py-6 space-y-3 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{t('productAdded')}</h4>
                  <p className="text-xs text-slate-500 font-semibold">Barcode: {generatedBarcode}</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveGeneratedProduct();
                  }}
                  className="space-y-4"
                >
                  {/* Generated Barcode Card Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-center shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                      <Barcode className="w-4 h-4" />
                      <span>{t('eanBarcodeLabel')}</span>
                    </div>

                    <p className="text-2xl font-black font-mono tracking-widest text-white">
                      {generatedBarcode || '8901234567890'}
                    </p>

                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('generateBarcode')}</span>
                    </button>
                  </div>

                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                      {t('productName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Fortune Mustard Oil 1L"
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
                        placeholder="140"
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
                        placeholder="165"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Initial Stock Quantity */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                      {t('initialQuantity')}
                    </label>
                    <input
                      type="number"
                      value={initialQty}
                      onChange={(e) => setInitialQty(e.target.value)}
                      placeholder="10"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        toast.info(t('printBarcode'));
                      }}
                      className="w-1/3 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{t('printBarcode')}</span>
                    </button>

                    <button
                      type="submit"
                      className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      {t('saveProduct')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AddStockPage;
