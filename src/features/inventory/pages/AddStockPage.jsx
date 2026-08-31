import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Camera,
  CheckCircle,
  Minus,
  Plus,
  Printer,
  ArrowLeft,
  Barcode,
  Sparkles,
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../../constants/mockProducts';
import { inventoryService } from '../services/inventoryService';
import InventoryActionCards from '../components/InventoryActionCards';
import BarcodePreviewCard from '../components/BarcodePreviewCard';

const AddStockPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'scan', 'create'

  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const [scannedBarcode, setScannedBarcode] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [qtyToAdd, setQtyToAdd] = useState(10);
  const [stockUpdateSuccess, setStockUpdateSuccess] = useState(null);

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [initialQty, setInitialQty] = useState('10');

  const [generatedBarcode, setGeneratedBarcode] = useState(null); // Initially null until user clicks Generate Barcode
  const [createSuccess, setCreateSuccess] = useState(false);

  const simulateScanResult = (barcodeToScan) => {
    setScannedBarcode(barcodeToScan);

    const matched = products.find((p) => p.barcode === barcodeToScan);
    if (matched) {
      setFoundProduct(matched);
      setQtyToAdd(10);
    } else {
      setFoundProduct(null);
    }
  };

  const handleConfirmAddStock = () => {
    if (!foundProduct) return;

    const prevStock = foundProduct.stock;
    const addedAmount = parseInt(qtyToAdd, 10) || 1;
    const newStockAmount = prevStock + addedAmount;

    setProducts((prev) =>
      prev.map((p) => (p.id === foundProduct.id ? { ...p, stock: newStockAmount } : p))
    );

    const msg = `Stock updated: +${addedAmount} ${foundProduct.unit} for ${foundProduct.name}`;
    setStockUpdateSuccess({
      productName: foundProduct.name,
      previousStock: prevStock,
      added: addedAmount,
      newStock: newStockAmount,
    });
    toast.success(msg);

    setFoundProduct(null);
    setTimeout(() => {
      setStockUpdateSuccess(null);
    }, 2500);
  };

  // Generates unique 13-digit EAN barcode
  const handleGenerateBarcode = () => {
    const uniqueCode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setGeneratedBarcode(uniqueCode);
    toast.info(`Generated Barcode: ${uniqueCode}`);
  };

  const handleSaveGeneratedProduct = () => {
    const codeToSave = generatedBarcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const nameToSave = productName || 'New Product';

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

    toast.success(`Product "${nameToSave}" (${codeToSave}) saved to catalog!`);

    setTimeout(() => {
      setCreateSuccess(false);
      setActiveTab('menu');
      setGeneratedBarcode(null);
      setProductName('');
      setPurchasePrice('');
      setSellingPrice('');
    }, 1800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 relative">
      {/* MENU VIEW */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="pt-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('addStock')}
            </h1>
          </div>

          <InventoryActionCards
            onSelectScan={() => setActiveTab('scan')}
            onSelectCreate={() => {
              setActiveTab('create');
              setGeneratedBarcode(null);
            }}
          />
        </div>
      )}

      {/* SCAN BARCODE FLOW */}
      {activeTab === 'scan' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h3 className="font-extrabold text-slate-900 text-base">{t('scanBarcode')}</h3>
          </div>

          {stockUpdateSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 text-base font-extrabold">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span>✓ {t('stockUpdated')} ({stockUpdateSuccess.productName})</span>
              </div>
              <div className="text-xs text-slate-600 flex gap-4 pt-1 font-mono">
                <span>{t('previousStock')}: <strong>{stockUpdateSuccess.previousStock}</strong></span>
                <span>{t('added')}: <strong className="text-emerald-700">+{stockUpdateSuccess.added}</strong></span>
                <span>{t('newStock')}: <strong className="text-emerald-900">{stockUpdateSuccess.newStock}</strong></span>
              </div>
            </div>
          )}

          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">{t('pointCamera')}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
              Demo Scanner Controls
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => simulateScanResult('8901234567890')}
                className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              >
                Scan Maggi 70g
              </button>
              <button
                type="button"
                onClick={() => simulateScanResult('8901234512340')}
                className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              >
                Scan Amul Milk 1L
              </button>
            </div>
          </div>

          {foundProduct && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <span className="font-extrabold text-emerald-800 text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>{t('productFound')} ✓</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  {foundProduct.barcode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">{t('productName')}</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{foundProduct.name}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">{t('currentStock')}</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-1">
                    {foundProduct.stock} {foundProduct.unit}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">{t('sellingPrice')}</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">₹{foundProduct.sellingPrice}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 text-center">
                  {t('quantityToAdd')}
                </label>

                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQtyToAdd((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-extrabold text-xl flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <span className="text-3xl font-black text-slate-900 w-16 text-center">
                    {qtyToAdd}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQtyToAdd((q) => q + 1)}
                    className="w-12 h-12 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-extrabold text-xl flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmAddStock}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-lg shadow-md transition-all cursor-pointer"
              >
                Add Stock (+{qtyToAdd})
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE BARCODE & ADD PRODUCT */}
      {activeTab === 'create' && (
        <div className="space-y-5">
          <div>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-base transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 leading-tight">
              Create Barcode & Add Product
            </h1>
          </div>

          {createSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-sm flex items-center gap-2 animate-pulse">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>✓ Product and unique barcode saved to catalog!</span>
            </div>
          )}

          {/* Form Inputs Container */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-600">
                {t('productName')}
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Potato 1kg"
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-600">
                {t('category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Pulses">Pulses</option>
                <option value="Staples">Staples</option>
                <option value="Snacks">Snacks</option>
                <option value="Dairy">Dairy</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-600">
                {t('unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Piece">Piece</option>
                <option value="Litre">Litre</option>
                <option value="Pack">Pack</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-600">
                  {t('purchasePrice')}
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="20"
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-600">
                  {t('sellingPrice')}
                </label>
                <input
                  type="number"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="30"
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase text-slate-600">
                {t('initialQuantity')}
              </label>
              <input
                type="number"
                required
                value={initialQty}
                onChange={(e) => setInitialQty(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Generate Barcode Button */}
          {!generatedBarcode ? (
            <button
              type="button"
              onClick={handleGenerateBarcode}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.99] text-white font-extrabold text-lg md:text-xl rounded-2xl shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Generate Barcode</span>
            </button>
          ) : (
            <div className="space-y-4">
              {/* Generated Barcode Visual Card */}
              <BarcodePreviewCard barcode={generatedBarcode} productName={productName || 'Generated Product'} />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    toast.info(`Printing barcode labels for ${generatedBarcode}...`);
                  }}
                  className="px-2 sm:px-4 py-3.5 sm:py-4 bg-white border-2 border-slate-200 text-slate-900 font-extrabold rounded-2xl text-xs sm:text-base flex items-center justify-center gap-1.5 hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 shrink-0" />
                  <span>Print Barcode</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveGeneratedProduct}
                  className="px-2 sm:px-4 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-base flex items-center justify-center shadow-md shadow-emerald-600/25 active:scale-[0.99] cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddStockPage;
