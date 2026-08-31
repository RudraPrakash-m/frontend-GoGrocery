import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Share2, ShoppingBag } from 'lucide-react';

const ReceiptBill = ({ invoice, onNewSale, onClose }) => {
  const { t } = useTranslation();

  if (!invoice) return null;

  const {
    invoiceNo = 'INV-10245',
    date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    total = 0,
    subtotal = 0,
    discount = 0,
    paymentMode = 'UPI',
    storeName = 'GoGrocery',
    address = 'Plot 21, Market Road, Bhubaneswar',
    phone = '7846807407',
    gstin = '21ABCDE1234F1Z5',
    items = [],
  } = invoice;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🧾 *Invoice from ${storeName}*\nBill No: ${invoiceNo}\nTotal Amount: ₹${total}\nPaid via: ${paymentMode}\nThank you for shopping with us!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-100 rounded-3xl p-4 md:p-6 max-w-md mx-auto space-y-4">
      {/* Printable Thermal Paper Receipt Card */}
      <div id="printableReceipt" className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 font-mono text-slate-800 space-y-4 text-xs">
        {/* Receipt Header */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 font-sans">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 object-contain mx-auto mb-1"
          />
          <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
            {storeName}
          </h2>
          <p className="text-[11px] font-medium text-slate-500">{address}</p>
          <p className="text-[11px] font-medium text-slate-500">Ph: {phone} | GSTIN: {gstin}</p>
        </div>

        {/* Bill Meta Info */}
        <div className="flex justify-between items-center py-1 text-[11px] font-semibold border-b border-dashed border-slate-300 pb-3 font-sans">
          <div>
            <p className="text-slate-500">{t('invoiceNo')}: <span className="text-slate-900 font-bold">{invoiceNo}</span></p>
            <p className="text-slate-500">{date} · {time}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] uppercase">
              {paymentMode} {t('paid') || 'PAID'}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2 py-1 font-sans">
          <div className="grid grid-cols-12 font-extrabold uppercase text-[10px] text-slate-400 border-b border-slate-200 pb-1">
            <span className="col-span-6">{t('itemHeader')}</span>
            <span className="col-span-2 text-center">{t('qtyHeader')}</span>
            <span className="col-span-2 text-right">{t('rateHeader')}</span>
            <span className="col-span-2 text-right">{t('amtHeader')}</span>
          </div>

          <div className="divide-y divide-slate-100 space-y-1.5 pt-1">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] font-bold text-slate-800 pt-1">
                <span className="col-span-6 truncate text-slate-900">{item.name}</span>
                <span className="col-span-2 text-center">{item.qty}</span>
                <span className="col-span-2 text-right">₹{item.price}</span>
                <span className="col-span-2 text-right text-emerald-700">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-3 border-t border-dashed border-slate-300 space-y-1.5 font-sans">
          <div className="flex justify-between text-[11px] font-medium text-slate-500">
            <span>{t('subtotal')}</span>
            <span>₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[11px] font-medium text-rose-500">
              <span>{t('discount')}</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>{t('totalBill')}</span>
            <span className="text-emerald-600 text-xl font-extrabold">₹{total}</span>
          </div>
        </div>

        {/* Footer & Barcode */}
        <div className="text-center pt-4 border-t border-dashed border-slate-300 space-y-2 font-sans">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            *** {t('thankYouShopping')} {storeName}! ***
          </p>
          <div className="bg-slate-100 p-2 rounded-xl inline-block mx-auto">
            {/* Visual Barcode Graphic */}
            <div className="flex items-center justify-center gap-1 h-8 px-4 bg-white rounded border border-slate-200">
              <div className="w-1 h-6 bg-slate-900" />
              <div className="w-0.5 h-6 bg-slate-900" />
              <div className="w-2 h-6 bg-slate-900" />
              <div className="w-1 h-6 bg-slate-900" />
              <div className="w-1.5 h-6 bg-slate-900" />
              <div className="w-0.5 h-6 bg-slate-900" />
              <div className="w-2 h-6 bg-slate-900" />
            </div>
            <p className="text-[9px] font-mono font-bold text-slate-500 mt-1">{invoiceNo}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 font-sans pt-1">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t('printThermalReceipt')}</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{t('shareWhatsApp')}</span>
        </button>

        {onNewSale && (
          <button
            type="button"
            onClick={onNewSale}
            className="w-full py-3.5 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 font-extrabold text-sm rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>{t('startNewSale')}</span>
          </button>
        )}

        {onClose && !onNewSale && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 transition-all cursor-pointer"
          >
            {t('closeReceipt')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptBill;
