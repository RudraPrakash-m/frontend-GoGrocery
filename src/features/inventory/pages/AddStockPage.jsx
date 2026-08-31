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
  Plus,
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../../constants/mockProducts';
import ProductScanner from '../../../components/scanner/ProductScanner';

const AddStockPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n.language === 'or';

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scanExisting', 'createProductModal'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Search / Scan Product for Quick Restock
  const [searchQuery, setSearchQuery] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('1'); // Default to 1
  const [stockUpdateSuccess, setStockUpdateSuccess] = useState(null);

  // Create Barcode & Add New Product State
  const [generatedBarcode, setGeneratedBarcode] = useState(null);
  const [isScannedBarcode, setIsScannedBarcode] = useState(false); // True if pre-filled from camera/USB barcode scan
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [initialQty, setInitialQty] = useState('10');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Print Barcode Label Modal State
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);

  // When Existing Product is Scanned/Selected
  const handleSelectProductToRestock = (product) => {
    setFoundProduct(product);
    setQuantityToAdd('1'); // Default to +1
  };

  // When Scanned Barcode DOES NOT EXIST -> Auto-redirect to New Product Form with barcode pre-filled
  const handleUnrecognizedBarcodeScanned = (scannedBarcode) => {
    toast.info(isOdia ? 'ଉତ୍ପାଦ ମିଳିଲା ନାହିଁ। ନୂଆ ଉତ୍ପାଦ ଯୋଡନ୍ତୁ।' : `Barcode ${scannedBarcode} not in catalog. Enter product details below.`);
    setGeneratedBarcode(scannedBarcode);
    setIsScannedBarcode(true); // Hide "Generate Barcode" button since barcode is already scanned from camera
    setProductName('');
    setSellingPrice('');
    setPurchasePrice('');
    setInitialQty('10');
    setActiveTab('createProductModal');
  };

  // Restock Existing Product Submit (Increase by entered quantity or default to +1)
  const handleUpdateStockSubmit = (e) => {
    e.preventDefault();
    if (!foundProduct) return;

    const parsedQty = parseInt(quantityToAdd, 10);
    const addedAmount = isNaN(parsedQty) || parsedQty <= 0 ? 1 : parsedQty;
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
    setActiveTab('menu');
    setTimeout(() => {
      setStockUpdateSuccess(null);
    }, 2500);
  };

  // Generates unique 13-digit EAN barcode manually
  const handleGenerateBarcode = () => {
    const uniqueCode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setGeneratedBarcode(uniqueCode);
    setIsScannedBarcode(false);
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
      setIsScannedBarcode(false);
      setProductName('');
      setSellingPrice('');
      setPurchasePrice('');
    }, 2000);
  };

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
          onClick={() => {
            setFoundProduct(null);
            setActiveTab('scanExisting');
          }}
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

      {/* QUICK RESTOCK CAMERA & SEARCH SCANNER PORTAL */}
      {activeTab === 'scanExisting' &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            {!foundProduct ? (
              <ProductScanner
                onProductFound={(prod) => {
                  handleSelectProductToRestock(prod);
                }}
                onProductNotFound={(result) => {
                  handleUnrecognizedBarcodeScanned(result.value);
                }}
                onClose={() => {
                  setActiveTab('menu');
                  setFoundProduct(null);
                }}
              />
            ) : (
              /* RESTOCK QUANTITY FORM AFTER EXISTING PRODUCT IS SCANNED */
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

                <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{foundProduct.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{t('barcode')}: {foundProduct.barcode}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-lg">
                        {t('currentStock')}: {foundProduct.stock} {foundProduct.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input Field with Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                      {t('quantityToAdd')} ({foundProduct.unit})
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="1 (Default: +1)"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border-2 border-emerald-500 rounded-2xl text-slate-900 font-black text-xl text-center focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />

                    {/* Quick Preset Buttons: +1, +5, +10, +50 */}
                    <div className="flex items-center gap-1.5 justify-center pt-1">
                      <span className="text-[11px] font-bold text-slate-400">Quick Add:</span>
                      {['1', '5', '10', '50'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuantityToAdd(preset)}
                          className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            quantityToAdd === preset
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFoundProduct(null)}
                      className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer"
                    >
                      {t('cancel')}
                    </button>

                    <button
                      type="submit"
                      className="w-1/2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer"
                    >
                      Add +{parseInt(quantityToAdd, 10) || 1} Stock
                    </button>
                  </div>
                </form>
              </div>
            )}
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
                onClick={() => {
                  setActiveTab('menu');
                  setIsScannedBarcode(false);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isScannedBarcode ? 'Add Scanned Product' : t('createProductTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {isScannedBarcode ? 'Enter details for newly scanned barcode item' : t('createProductSubtitle')}
                  </p>
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
                  {/* Barcode Display Card Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-center shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                      <Barcode className="w-4 h-4" />
                      <span>{isScannedBarcode ? 'Scanned Product Package Barcode' : t('eanBarcodeLabel')}</span>
                    </div>

                    <p className="text-2xl font-black font-mono tracking-widest text-white">
                      {generatedBarcode || '8901234567890'}
                    </p>

                    {/* HIDE Generate Barcode button when barcode comes from scanner camera */}
                    {!isScannedBarcode && (
                      <button
                        type="button"
                        onClick={handleGenerateBarcode}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('generateBarcode')}</span>
                      </button>
                    )}

                    {isScannedBarcode && (
                      <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] rounded-full border border-emerald-500/30">
                        ✓ Scanned from Product Package
                      </span>
                    )}
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

                  {/* RESPONSIVE ACTION BUTTONS CONTAINER */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPrintLabelModal(true)}
                      className="flex-1 py-3 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                    >
                      <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t('printBarcode')}</span>
                    </button>

                    <button
                      type="submit"
                      className="flex-[1.5] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap"
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

      {/* PRINT BARCODE LABEL MODAL PORTAL */}
      {showPrintLabelModal &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn text-center">
              <button
                type="button"
                onClick={() => setShowPrintLabelModal(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 justify-center border-b border-slate-100 pb-3 text-slate-900 font-extrabold">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>Barcode Label Sticker</span>
              </div>

              {/* Printable Barcode Label Card */}
              <div id="printableBarcodeSticker" className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-2 text-center shadow-md font-mono text-slate-900">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700 font-sans">
                  GoGrocery Kirana
                </p>
                <p className="text-sm font-extrabold font-sans text-slate-900 truncate">
                  {productName || 'Sample Grocery Product'}
                </p>
                <p className="text-lg font-black font-sans text-emerald-600">
                  ₹{sellingPrice || '45'}
                </p>

                {/* Barcode Graphic */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 inline-block w-full">
                  <div className="flex items-center justify-center gap-1 h-10 px-2 bg-white rounded border border-slate-200">
                    <div className="w-1 h-8 bg-slate-900" />
                    <div className="w-0.5 h-8 bg-slate-900" />
                    <div className="w-2 h-8 bg-slate-900" />
                    <div className="w-1 h-8 bg-slate-900" />
                    <div className="w-1.5 h-8 bg-slate-900" />
                    <div className="w-0.5 h-8 bg-slate-900" />
                    <div className="w-2.5 h-8 bg-slate-900" />
                    <div className="w-1 h-8 bg-slate-900" />
                    <div className="w-2 h-8 bg-slate-900" />
                  </div>
                  <p className="text-xs font-mono font-extrabold text-slate-800 mt-1.5 tracking-widest">
                    {generatedBarcode || '8901234567890'}
                  </p>
                </div>
              </div>

              {/* Print Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Barcode Label</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintLabelModal(false)}
                  className="w-full py-2 text-xs font-extrabold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AddStockPage;
