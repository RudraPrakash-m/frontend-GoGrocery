import React from 'react';

const BarcodePreviewCard = ({ barcode, productName }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-center space-y-3">
      <div className="py-2 flex justify-center">
        <div className="h-28 w-full max-w-xs flex items-center justify-center gap-1 px-4">
          {[4, 2, 5, 2, 3, 6, 2, 4, 3, 2, 5, 3, 2, 4, 2, 3, 5, 2, 4, 2, 3, 5].map((w, i) => (
            <div
              key={i}
              className="h-full bg-slate-950"
              style={{ width: `${w * 1.8}px` }}
            />
          ))}
        </div>
      </div>

      <p className="font-mono text-2xl font-black text-slate-900 tracking-widest">
        {barcode}
      </p>
      <p className="text-xs font-semibold text-slate-400 lowercase">
        {productName || 'ds'}
      </p>
    </div>
  );
};

export default BarcodePreviewCard;
