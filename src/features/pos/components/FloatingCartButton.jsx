import React from 'react';
import { ShoppingCart } from 'lucide-react';

const FloatingCartButton = ({ totalItems, totalAmount, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-5 z-40 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3.5 rounded-3xl shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 text-base active:scale-95 transition-all"
    >
      <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
      <span>
        {totalItems} · ₹{totalAmount}
      </span>
    </button>
  );
};

export default FloatingCartButton;
