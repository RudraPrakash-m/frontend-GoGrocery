import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Scan,
  PlusCircle,
  CheckCircle,
  X,
  Printer,
  Sparkles,
  Barcode,
  Loader2,
  Package,
} from 'lucide-react';
import ProductScanner from '../../../components/scanner/ProductScanner';
import { productService } from '../../products/services/productService';
import {
  validateRestockQty,
  validateNewProductForm,
} from '../../products/validation/productValidation';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

const AddStockPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n.language === 'or';

  useDocumentTitle(isOdia ? 'ଷ୍ଟକ୍ ଯୋଡନ୍ତୁ' : 'Add Stock');

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scanExisting', 'createProductModal'

  // Restock Existing Product State
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('1'); // Default to +1
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError] = useState(null);
  const [stockUpdateSuccess, setStockUpdateSuccess] = useState(null);

  // Create New Product State
  const [generatedBarcode, setGeneratedBarcode] = useState(null);
  const [isScannedBarcode, setIsScannedBarcode] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [initialQty, setInitialQty] = useState('10');
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [createSuccess, setCreateSuccess] = useState(false);

  // Print Barcode Label Modal State
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);

  // When Existing Product is Scanned/Selected from scanner
  const handleSelectProductToRestock = (product) => {
    setFoundProduct(product);
    setQuantityToAdd('1'); // Default to +1
    setRestockError(null);
  };

  // When Scanned Barcode DOES NOT EXIST -> Auto-redirect to New Product Form with barcode pre-filled
  const handleUnrecognizedBarcodeScanned = (scannedBarcode) => {
    toast.info(
      isOdia
        ? 'ଉତ୍ପାଦ ମିଳିଲା ନାହିଁ। ନୂଆ ଉତ୍ପାଦ ଯୋଡନ୍ତୁ।'
        : `Barcode ${scannedBarcode} not in catalog. Enter product details below.`
    );
    setGeneratedBarcode(scannedBarcode);
    setIsScannedBarcode(true);
    setProductName('');
    setSellingPrice('');
    setPurchasePrice('');
    setInitialQty('10');
    setCreateErrors({});
    setActiveTab('createProductModal');
  };

  // Restock Existing Product Submit (Only updates quantity)
  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (!foundProduct) return;

    // Validation
    const qtyError = validateRestockQty(quantityToAdd);
    if (qtyError) {
      const displayErr = isOdia
        ? 'ଦୟାକରି ଯୋଡିବା ପାଇଁ ସଠିକ୍ ପରିମାଣ ଦିଅନ୍ତୁ (୧ କିମ୍ବା ଅଧିକ)'
        : qtyError;
      setRestockError(displayErr);
      toast.error(displayErr);
      return;
    }
    setRestockError(null);
    setRestockLoading(true);

    const addedAmount = parseInt(quantityToAdd, 10);
    const prevStock = Number(foundProduct.stock) || 0;

    try {
      // Calls POST /api/products/restock with { barcode, productId, quantityAdded }
      const res = await productService.restockProduct({
        barcode: foundProduct.barcode,
        productId: foundProduct.id || foundProduct._id,
        quantityAdded: addedAmount,
      });

      const resData = res?.data || res;
      const prev = resData.previousStock !== undefined ? resData.previousStock : prevStock;
      const added = resData.quantityAdded !== undefined ? resData.quantityAdded : addedAmount;
      const curr = resData.currentStock !== undefined ? resData.currentStock : prevStock + addedAmount;
      const unitName = resData.unit || foundProduct.unit || 'Pcs';
      const prodName = resData.name || foundProduct.name;

      setStockUpdateSuccess({
        productName: prodName,
        previousStock: prev,
        added: added,
        newStock: curr,
        unit: unitName,
      });

      // Toast notification with rich Odia & English support
      if (isOdia) {
        toast.success(`"${prodName}" ରେ +${added} ${unitName} ଯୋଡାଗଲା! (ମୋଟ: ${curr} ${unitName})`);
      } else {
        toast.success(
          res?.message
            ? `${res.message}: "${prodName}" (+${added} ${unitName}) → Total: ${curr} ${unitName}`
            : `${prodName}: +${added} ${unitName} added successfully! (Total Stock: ${curr} ${unitName})`
        );
      }

      setFoundProduct(null);
      setActiveTab('menu');

      setTimeout(() => {
        setStockUpdateSuccess(null);
      }, 4000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        (isOdia ? 'ଷ୍ଟକ୍ ଅଦ୍ୟତନ କରିବାରେ ତ୍ରୁଟି ଘଟିଲା।' : 'Failed to update stock. Please try again.');
      setRestockError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setRestockLoading(false);
    }
  };

  // Generates unique 13-digit EAN barcode manually for loose/unbranded goods
  const handleGenerateBarcode = () => {
    const uniqueCode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setGeneratedBarcode(uniqueCode);
    setIsScannedBarcode(false);
    toast.info(`${t('generatedBarcodeInfo') || 'Generated Barcode'}: ${uniqueCode}`);
  };

  // Create Brand New Product Submit
  const handleSaveGeneratedProduct = async (e) => {
    if (e) e.preventDefault();

    const codeToSave =
      generatedBarcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const formValues = {
      name: productName,
      sellingPrice,
      purchasePrice,
      stock: initialQty,
      category,
      unit,
      barcode: codeToSave,
    };

    // Client-side validation
    const validation = validateNewProductForm(formValues);
    if (!validation.isValid) {
      setCreateErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }
    setCreateErrors({});
    setCreateLoading(true);

    try {
      // Calls POST /api/products with full product payload
      const res = await productService.createProduct({
        name: productName.trim(),
        barcode: codeToSave,
        category,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
        sellingPrice: parseFloat(sellingPrice),
        unit,
        stock: parseInt(initialQty, 10) || 0,
        minStock: 5,
        isLoose: false,
      });

      const created = res?.data || res;
      const prodName = created.name || productName;
      const initStock = created.stock !== undefined ? created.stock : initialQty;
      const unitVal = created.unit || unit;

      setCreateSuccess(true);
      if (isOdia) {
        toast.success(
          `ଉତ୍ପାଦ "${prodName}" ସଫଳତାର ସହିତ ଯୋଡାଗଲା! ପ୍ରାରମ୍ଭିକ ଷ୍ଟକ୍: ${initStock} ${unitVal}`
        );
      } else {
        toast.success(
          `Product "${prodName}" registered successfully! Initial Stock: ${initStock} ${unitVal}`
        );
      }

      setTimeout(() => {
        setCreateSuccess(false);
        setActiveTab('menu');
        setGeneratedBarcode(null);
        setIsScannedBarcode(false);
        setProductName('');
        setSellingPrice('');
        setPurchasePrice('');
        setInitialQty('10');
      }, 2000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        (isOdia ? 'ଉତ୍ପାଦ ସେଭ୍ କରିବାରେ ତ୍ରୁଟି ଘଟିଲା।' : 'Failed to save product. Please try again.');
      toast.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 relative pb-20">
      {/* Title */}
      <div className="pt-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('addStock') || 'Add & Restock Inventory'}
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Scan to quickly replenish existing stock, or register new products.
        </p>
      </div>

      {/* Stock Update Toast Success Banner */}
      {stockUpdateSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('stockUpdated') || 'Stock Updated Successfully'}</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            <strong className="text-slate-900">{stockUpdateSuccess.productName}</strong>: {t('previousStock') || 'Previous Stock'}{' '}
            <strong>{stockUpdateSuccess.previousStock}</strong> → {t('added') || 'Added'}{' '}
            <strong className="text-emerald-700">+{stockUpdateSuccess.added}</strong> → {t('newStock') || 'Current Stock'}{' '}
            <strong>{stockUpdateSuccess.newStock} {stockUpdateSuccess.unit}</strong>
          </p>
        </div>
      )}

      {/* TWO HERO INVENTORY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Restock Existing Stock (Medium 1) */}
        <button
          type="button"
          onClick={() => {
            setFoundProduct(null);
            setRestockError(null);
            setActiveTab('scanExisting');
          }}
          className="bg-white border-2 border-slate-200/90 hover:border-emerald-500 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4 group cursor-pointer"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <Scan className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
              {t('quickRestockTitle') || 'Quick Restock (Scan Barcode)'}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {t('quickRestockSubtitle') || 'Scan existing product barcode to add stock quantity.'}
            </p>
          </div>
        </button>

        {/* Card 2: Create Barcode & Add New Product (Medium 2) */}
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
              {t('createProductTitle') || 'Create New Product'}
            </h3>
            <p className="text-xs text-emerald-100 font-medium mt-1">
              {t('createProductSubtitle') || 'Generate barcode and add new item to your store catalog.'}
            </p>
          </div>
        </button>
      </div>

      {/* QUICK RESTOCK CAMERA & SCANNER PORTAL */}
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
                  setRestockError(null);
                }}
              />
            ) : (
              /* RESTOCK QUANTITY FORM AFTER EXISTING PRODUCT IS SCANNED */
              <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 my-auto relative animate-fadeIn">
                <button
                  type="button"
                  disabled={restockLoading}
                  onClick={() => {
                    setActiveTab('menu');
                    setFoundProduct(null);
                    setRestockError(null);
                  }}
                  className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
                  {/* Product Header Info Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="pr-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {isOdia ? 'ଉପଲବ୍ଧ ଉତ୍ପାଦ ମିଳିଲା' : (t('existingItemFound') || 'Existing Item Found')}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-1">
                          {foundProduct.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {t('barcode') || 'Barcode'}: {foundProduct.barcode}
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-lg shrink-0">
                        {t('currentStock') || 'Current'}: {foundProduct.stock} {foundProduct.unit || 'Pcs'}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input Field with Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                      {t('quantityToAdd') || 'Quantity to Add'} ({foundProduct.unit || 'Pcs'}) *
                    </label>

                    <input
                      type="number"
                      min="1"
                      disabled={restockLoading}
                      placeholder="1"
                      value={quantityToAdd}
                      onChange={(e) => {
                        setQuantityToAdd(e.target.value);
                        setRestockError(null);
                      }}
                      className={`w-full p-3.5 bg-slate-50 border-2 rounded-2xl text-slate-900 font-black text-xl text-center focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                        restockError
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-emerald-500 focus:ring-emerald-600'
                      }`}
                    />
                    {restockError && (
                      <p className="text-xs font-bold text-rose-500 text-center">{restockError}</p>
                    )}

                    {/* Quick Preset Buttons: +1, +5, +10, +50 */}
                    <div className="flex items-center gap-1.5 justify-center pt-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isOdia ? 'ଶୀଘ୍ର ଯୋଡନ୍ତୁ:' : (t('quickAdd') || 'Quick Add:')}
                      </span>
                      {['1', '5', '10', '50'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={restockLoading}
                          onClick={() => {
                            setQuantityToAdd(preset);
                            setRestockError(null);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer disabled:opacity-50 ${
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
                      disabled={restockLoading}
                      onClick={() => {
                        setFoundProduct(null);
                        setRestockError(null);
                      }}
                      className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer disabled:opacity-50"
                    >
                      {t('cancel') || 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={restockLoading}
                      className="w-1/2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {restockLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isOdia ? 'ଅଦ୍ୟତନ ହେଉଛି...' : (t('updatingStock') || 'Updating...')}</span>
                        </>
                      ) : (
                        <span>
                          {isOdia
                            ? `+${parseInt(quantityToAdd, 10) || 1} ଷ୍ଟକ୍ ଯୋଡନ୍ତୁ`
                            : `Add +${parseInt(quantityToAdd, 10) || 1} Stock`}
                        </span>
                      )}
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
                disabled={createLoading}
                onClick={() => {
                  setActiveTab('menu');
                  setIsScannedBarcode(false);
                  setCreateErrors({});
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isScannedBarcode
                      ? 'Register Scanned Product'
                      : t('createProductTitle') || 'Create New Product'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {isScannedBarcode
                      ? 'Enter details for newly scanned barcode item'
                      : t('createProductSubtitle') || 'Add a new item to your store catalog'}
                  </p>
                </div>
              </div>

              {createSuccess ? (
                <div className="text-center py-6 space-y-3 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">
                    {t('productAdded') || 'Product Added Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono font-semibold">
                    Barcode: {generatedBarcode}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveGeneratedProduct} className="space-y-4" noValidate>
                  {/* Barcode Display Card Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-center shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                      <Barcode className="w-4 h-4" />
                      <span>
                        {isScannedBarcode
                          ? 'Scanned Package Barcode'
                          : t('eanBarcodeLabel') || '13-Digit EAN Barcode'}
                      </span>
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
                        <span>{t('generateBarcode') || 'Generate New Code'}</span>
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
                      {t('productName') || 'Product Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={createLoading}
                      value={productName}
                      onChange={(e) => {
                        setProductName(e.target.value);
                        if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: null }));
                      }}
                      placeholder="e.g. Fortune Mustard Oil 1L"
                      className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 ${
                        createErrors.name
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                    {createErrors.name && (
                      <p className="text-xs font-bold text-rose-500 pl-1">{createErrors.name}</p>
                    )}
                  </div>

                  {/* Category & Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase text-slate-700">
                        {t('category') || 'Category'} *
                      </label>
                      <select
                        value={category}
                        disabled={createLoading}
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
                        disabled={createLoading}
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
                        disabled={createLoading}
                        value={purchasePrice}
                        onChange={(e) => {
                          setPurchasePrice(e.target.value);
                          if (createErrors.purchasePrice)
                            setCreateErrors((prev) => ({ ...prev, purchasePrice: null }));
                        }}
                        placeholder="140"
                        className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 disabled:opacity-60 ${
                          createErrors.purchasePrice
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                            : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                      {createErrors.purchasePrice && (
                        <p className="text-[11px] font-bold text-rose-500 pl-1">
                          {createErrors.purchasePrice}
                        </p>
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
                        disabled={createLoading}
                        value={sellingPrice}
                        onChange={(e) => {
                          setSellingPrice(e.target.value);
                          if (createErrors.sellingPrice)
                            setCreateErrors((prev) => ({ ...prev, sellingPrice: null }));
                        }}
                        placeholder="165"
                        className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 disabled:opacity-60 ${
                          createErrors.sellingPrice
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                            : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                      {createErrors.sellingPrice && (
                        <p className="text-[11px] font-bold text-rose-500 pl-1">
                          {createErrors.sellingPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Initial Stock Quantity */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                      {t('initialQuantity') || 'Initial Stock Quantity'} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={createLoading}
                      value={initialQty}
                      onChange={(e) => {
                        setInitialQty(e.target.value);
                        if (createErrors.stock)
                          setCreateErrors((prev) => ({ ...prev, stock: null }));
                      }}
                      placeholder="10"
                      className={`w-full p-3 bg-slate-50 border rounded-2xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 disabled:opacity-60 ${
                        createErrors.stock
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/50'
                          : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                    {createErrors.stock && (
                      <p className="text-xs font-bold text-rose-500 pl-1">{createErrors.stock}</p>
                    )}
                  </div>

                  {/* RESPONSIVE ACTION BUTTONS CONTAINER */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <button
                      type="button"
                      disabled={createLoading}
                      onClick={() => setShowPrintLabelModal(true)}
                      className="flex-1 py-3 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t('printBarcode') || 'Print Label'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="flex-[1.5] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isOdia ? 'ସେଭ୍ ହେଉଛି...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <span>{t('saveProduct') || 'Save Product'}</span>
                      )}
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
              <div
                id="printableBarcodeSticker"
                className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-2 text-center shadow-md font-mono text-slate-900"
              >
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
                  {t('close') || 'Close'}
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
