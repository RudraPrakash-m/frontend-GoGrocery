import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Headphones,
  PhoneCall,
  MessageSquare,
  Mail,
  Clock,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

const HelpPage = () => {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const isOdia = i18n.language === 'or';

  const faqs = [
    {
      q: isOdia ? 'ମୁଁ କିପରି ନୂଆ ଉତ୍ପାଦ ଯୋଡିବି ଏବଂ ବାରକୋଡ୍ ତିଆରି କରିବି?' : 'How do I add new products and generate barcodes?',
      a: isOdia ? 'ଷ୍ଟକ୍ ଯୋଡନ୍ତୁ ଟ୍ୟାବ୍ କୁ ଯାଆନ୍ତୁ, "ବାରକୋଡ୍ ତିଆରି କରି ଯୋଡନ୍ତୁ" ଦବାନ୍ତୁ, ଉତ୍ପାଦ ବିବରଣୀ ଦିଅନ୍ତୁ ଏବଂ ୧୩-ଅଙ୍କ ବିଶିଷ୍ଟ ବାରକୋଡ୍ ପାଆନ୍ତୁ।' : 'Go to Add Stock tab from bottom navigation, tap "Create Barcode & Add Product", enter product details, and click "Generate Barcode" to get a unique 13-digit barcode.',
    },
    {
      q: isOdia ? 'ଲ୍ୟାପଟପ୍ କିମ୍ବା କମ୍ପ୍ୟୁଟରରେ ବାରକୋଡ୍ କିପରି ସ୍କାନ୍ କରିବି?' : 'How do I scan barcodes using my laptop/PC?',
      a: isOdia ? 'ଆପଣଙ୍କ USB କିମ୍ବା ବ୍ଲୁଟୁଥ୍ ବାରକୋଡ୍ ସ୍କାନର୍ ଗନ୍ କନେକ୍ଟ କରନ୍ତୁ। ବିକ୍ରି ପୃଷ୍ଠାରେ ସ୍କାନ୍ କରନ୍ତୁ - ସିଷ୍ଟମ୍ ଆପେଆପେ ସ୍କାନ୍ କରି କାର୍ଟରେ ଯୋଡିଦେବ।' : 'Connect your USB or Bluetooth barcode scanner machine gun. On POS page, click "Scan Barcode" — the system automatically captures hardware scanner input and adds products to cart.',
    },
    {
      q: isOdia ? 'ରସିଦରେ ମୋ ଦୋକାନ ନାମ କିପରି ବଦଳାଇବି?' : 'How can I change my Kirana store name on receipts?',
      a: isOdia ? 'ଅଧିକ > ସେଟିଂସ୍ କୁ ଯାଆନ୍ତୁ, ଦୋକାନ ବିବରଣୀରେ ନୂଆ ନାମ ଦେଇ ସେଭ୍ କରନ୍ତୁ। ଏହା ତୁରନ୍ତ ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡ ଏବଂ ରସିଦରେ ଦେଖାଯିବ।' : 'Go to More > Settings, enter your store name under Store Details, and click "Save Store Details". It immediately updates on your Dashboard and prints on all customer bills.',
    },
    {
      q: isOdia ? 'ଗ୍ରାହକଙ୍କ ପୁରୁଣା ବିଲ୍ କିପରି ଦେଖିବି ଏବଂ ପ୍ରିଣ୍ଟ୍ କରିବି?' : 'How do I view and print past customer bills?',
      a: isOdia ? 'ଅଧିକ > ବିକ୍ରି କୁ ଯାଆନ୍ତୁ। ସମସ୍ତ ବିଲ୍ ଦେଖିପାରିବେ। "View Bill" ଦବାଇ ପ୍ରିଣ୍ଟ୍ କିମ୍ବା ୱାଟସଆପ୍ ରେ ସେୟାର୍ କରନ୍ତୁ।' : 'Go to More > Sales. You will see all completed invoices. Click the "View Bill" button on any sale row to open, print, or share the receipt on WhatsApp.',
    },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Headphones className="w-7 h-7 text-emerald-600 shrink-0" />
          <span>{t('help')}</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          {t('helpSubtitle')}
        </p>
      </div>

      {/* THREE HERO CONTACT CARDS */}
      <div className="space-y-3.5">
        {/* Phone Call Support Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs transition-all hover:border-emerald-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/80">
                <PhoneCall className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('tollFreeHelpline')}
                </p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate tracking-tight">
                  +91 7846807407
                </p>
                <p className="text-xs font-semibold text-slate-500 truncate">1800-123-4567 (Toll Free)</p>
              </div>
            </div>

            <a
              href="tel:7846807407"
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('callNow')}</span>
            </a>
          </div>
        </div>

        {/* WhatsApp Support Desk Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs transition-all hover:border-emerald-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/80">
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('whatsAppSupport')}
                </p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate tracking-tight">
                  +91 7846807407
                </p>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {isOdia ? 'ତୁରନ୍ତ ଚାଟ୍ ଏବଂ ରସିଦ ସାହାଯ୍ୟ' : 'Instant Chat & Invoice Assistance'}
                </p>
              </div>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=917846807407&text=Hi%20GoGrocery%20Helpdesk%2C%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Email Support Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs transition-all hover:border-blue-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/80">
                <Mail className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('emailSupport')}
                </p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 truncate tracking-tight">
                  support@gogrocery.in
                </p>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {isOdia ? '୨୪ ଘଣ୍ଟା ମଧ୍ୟରେ ଉତ୍ତର ଗ୍ୟାରେଣ୍ଟି' : 'Guaranteed response within 24 hours'}
                </p>
              </div>
            </div>

            <a
              href="mailto:support@gogrocery.in"
              className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>{t('emailUs')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* CORPORATE OFFICE & HOURS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <MapPin className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.2]" />
          <h3 className="font-extrabold text-slate-900 text-base">{t('officeAddress')}</h3>
        </div>

        <div className="space-y-2 text-xs font-semibold text-slate-600 leading-relaxed">
          <p className="font-extrabold text-slate-900 text-sm">GoGrocery POS Tech Hub</p>
          <p>Plot 21, Market Road, Master Canteen Square, Bhubaneswar, Odisha - 751001</p>
          <div className="flex items-center gap-2 text-slate-500 pt-1 border-t border-slate-100">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('supportHours')}</span>
          </div>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-purple-600 shrink-0 stroke-[2.2]" />
          <h3 className="font-extrabold text-slate-900 text-base">{t('faqs')}</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-extrabold text-slate-900 text-xs md:text-sm py-1 cursor-pointer gap-2"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 font-medium pt-2 leading-relaxed bg-slate-50 p-3.5 rounded-2xl mt-1.5 border border-slate-200/60">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OFFICIAL FOOTER BADGE */}
      <div className="text-center pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>GoGrocery Official Merchant Support</span>
        </span>
      </div>
    </div>
  );
};

export default HelpPage;
