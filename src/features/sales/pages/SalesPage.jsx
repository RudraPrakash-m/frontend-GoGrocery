import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Receipt, QrCode, Banknote, CreditCard, Eye, X } from 'lucide-react';
import ReceiptBill from '../components/ReceiptBill';

const SalesPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const salesHistory = useSelector((state) => state.sales.salesHistory || []);

  const totalSalesAmount = salesHistory.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalSalesCount = salesHistory.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('sales')}
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {t('salesSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <div className="text-right">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {t('totalSalesLabel')}
            </p>
            <p className="text-xl font-black text-emerald-600">₹{totalSalesAmount.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {t('billsLabel')}
            </p>
            <p className="text-xl font-black text-slate-900">{totalSalesCount}</p>
          </div>
        </div>
      </div>

      {/* Responsive Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('allInvoices')}
        </button>
        <button
          onClick={() => setFilter('UPI')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'UPI' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('upiPayments')}
        </button>
        <button
          onClick={() => setFilter('CASH')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'CASH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('cashPayments')}
        </button>
        <button
          onClick={() => setFilter('CARD')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('cardPayments')}
        </button>
      </div>

      {/* Transactions & Saved Bills List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b border-slate-100 pb-3">
          {t('savedInvoicesHeader')}
        </h3>

        {salesHistory.length === 0 ? (
          <p className="text-center py-10 text-slate-400 font-bold text-sm">
            {t('noSalesHistory')}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-1">
            {salesHistory
              .filter((s) => filter === 'all' || s.paymentMode === filter)
              .map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl p-3 transition-colors border-b border-slate-100/70 last:border-b-0"
                >
                  {/* Left Side: Receipt Icon + Invoice Code + Date */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm sm:text-base whitespace-nowrap tracking-tight">
                          {item.invoiceNo}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold truncate">
                          {item.date} · {item.time} ({item.itemsCount || (item.items ? item.items.length : 1)} {t('items')})
                        </p>
                      </div>
                    </div>

                    {/* Mobile Payment Mode Badge */}
                    <span
                      className={`sm:hidden text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                        item.paymentMode === 'UPI'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : item.paymentMode === 'CASH'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {item.paymentMode === 'UPI' && <QrCode className="w-3 h-3 text-blue-600" />}
                      {item.paymentMode === 'CASH' && <Banknote className="w-3 h-3 text-amber-600" />}
                      {item.paymentMode === 'CARD' && <CreditCard className="w-3 h-3 text-purple-600" />}
                      {item.paymentMode}
                    </span>
                  </div>

                  {/* Right Side: Price + View Bill Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100/80 sm:border-t-0">
                    {/* Desktop Payment Mode Badge */}
                    <span
                      className={`hidden sm:flex text-[10px] font-extrabold px-2.5 py-1 rounded-full items-center gap-1 shrink-0 ${
                        item.paymentMode === 'UPI'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : item.paymentMode === 'CASH'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {item.paymentMode === 'UPI' && <QrCode className="w-3 h-3 text-blue-600" />}
                      {item.paymentMode === 'CASH' && <Banknote className="w-3 h-3 text-amber-600" />}
                      {item.paymentMode === 'CARD' && <CreditCard className="w-3 h-3 text-purple-600" />}
                      {item.paymentMode}
                    </span>

                    <span className="font-black text-slate-900 text-lg md:text-xl shrink-0">
                      ₹{item.total}
                    </span>

                    {/* View Bill Action Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(item)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('viewBill')}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* VIEW BILL FULLSCREEN MODAL PORTAL */}
      {selectedInvoice &&
        createPortal(
          <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md my-auto">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-2 right-2 z-10 w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <ReceiptBill
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SalesPage;
