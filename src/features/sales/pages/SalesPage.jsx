import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Receipt, QrCode, Banknote, CreditCard, Eye, X } from 'lucide-react';
import ReceiptBill from '../components/ReceiptBill';
import { useSalesHistory } from '../hooks/useSalesQuery';
import Loader from '../../../components/common/Loader';

// Helper to normalize payment mode across all API and Redux object schemas
const getPaymentMode = (item) =>
  String(
    item?.paymentMethod || item?.paymentMode || item?.paymentBadge || item?.mode || ''
  ).toUpperCase();

const SalesPage = () => {
  const { t, i18n } = useTranslation();
  const isOdia = i18n?.language === 'or';
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const reduxSalesHistory = useSelector((state) => state.sales.salesHistory || []);
  const { data: salesResponse, isLoading } = useSalesHistory({ tab: filter });

  const apiSales = salesResponse?.data;
  const apiSummary = salesResponse?.summary;

  // Merge API sales with local Redux sales so newly sold items NEVER vanish across tabs
  const salesHistory = useMemo(() => {
    const list = Array.isArray(apiSales) ? [...apiSales] : [];
    reduxSalesHistory.forEach((reduxItem) => {
      const exists = list.some(
        (apiItem) =>
          (apiItem.invoiceNo && apiItem.invoiceNo === reduxItem.invoiceNo) ||
          (apiItem.id && String(apiItem.id) === String(reduxItem.id)) ||
          (apiItem._id && String(apiItem._id) === String(reduxItem.id))
      );
      if (!exists) {
        list.unshift(reduxItem);
      }
    });

    if (filter === 'all') return list;
    return list.filter((s) => getPaymentMode(s) === filter.toUpperCase());
  }, [apiSales, reduxSalesHistory, filter]);

  const totalSalesAmount = useMemo(() => {
    if (filter === 'all' && apiSummary?.totalSales !== undefined) {
      return apiSummary.totalSales;
    }
    return salesHistory.reduce(
      (sum, s) => sum + (s.total !== undefined ? s.total : (s.totalBill || s.netAmount || 0)),
      0
    );
  }, [apiSummary, salesHistory, filter]);

  const totalSalesCount = useMemo(() => {
    if (filter === 'all' && apiSummary?.totalBills !== undefined) {
      return apiSummary.totalBills;
    }
    return salesHistory.length;
  }, [apiSummary, salesHistory, filter]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <Loader
          text={isOdia ? 'ବିକ୍ରୟ ତଥ୍ୟ ଲୋଡ୍ ହେଉଛି...' : 'Loading sales data...'}
          fullScreen={false}
          className="py-24"
        />
      </div>
    );
  }

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

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:flex sm:items-center">
          {/* Card 1: Total Revenue */}
          <div className="bg-white p-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
                {t('totalSalesLabel') || 'Total Sales'}
              </p>
              <p className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">
                ₹{totalSalesAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Card 2: Total Bills */}
          <div className="bg-white p-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
                {t('billsLabel') || 'Total Bills'}
              </p>
              <p className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">
                {totalSalesCount}
              </p>
            </div>
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
            {salesHistory.map((item, index) => {
              const pMode = getPaymentMode(item);
              const invoiceId = item.id || item._id || item.invoiceNo || index;
              const dateStr = item.date || '';
              const timeStr = item.time || '';
              const dateTimeDisplay = item.formattedDateTime || `${dateStr}${timeStr ? ' · ' + timeStr : ''}`;
              const totalAmt = item.total !== undefined ? item.total : (item.totalBill !== undefined ? item.totalBill : (item.netAmount || 0));

              return (
                <div
                  key={invoiceId}
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
                          {dateTimeDisplay} ({item.itemsCount || (item.items ? item.items.length : 1)} {t('items')})
                        </p>
                      </div>
                    </div>

                    {/* Mobile Payment Mode Badge */}
                    <span
                      className={`sm:hidden text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                        pMode === 'UPI'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : pMode === 'CASH'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {pMode === 'UPI' && <QrCode className="w-3 h-3 text-blue-600" />}
                      {pMode === 'CASH' && <Banknote className="w-3 h-3 text-amber-600" />}
                      {pMode === 'CARD' && <CreditCard className="w-3 h-3 text-purple-600" />}
                      {pMode || 'CARD'}
                    </span>
                  </div>

                  {/* Right Side: Price + View Bill Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100/80 sm:border-t-0">
                    {/* Desktop Payment Mode Badge */}
                    <span
                      className={`hidden sm:flex text-[10px] font-extrabold px-2.5 py-1 rounded-full items-center gap-1 shrink-0 ${
                        pMode === 'UPI'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : pMode === 'CASH'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {pMode === 'UPI' && <QrCode className="w-3 h-3 text-blue-600" />}
                      {pMode === 'CASH' && <Banknote className="w-3 h-3 text-amber-600" />}
                      {pMode === 'CARD' && <CreditCard className="w-3 h-3 text-purple-600" />}
                      {pMode || 'CARD'}
                    </span>

                    <span className="font-black text-slate-900 text-lg md:text-xl shrink-0">
                      ₹{totalAmt}
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
              );
            })}
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
