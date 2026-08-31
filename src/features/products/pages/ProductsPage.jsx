import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { productService } from '../services/productService';
import ProductSearchBar from '../components/ProductSearchBar';

const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState(productService.getProducts());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'lowStock') return p.stock <= p.minStock && p.stock > 0;
    if (filter === 'outOfStock') return p.stock === 0;
    return true;
  });

  const counts = {
    all: products.length,
    lowStock: products.filter((p) => p.stock <= p.minStock && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title & Top Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('products')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Total {products.length} products in store
          </p>
        </div>

        <button
          onClick={() => navigate('/inventory/add')}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all self-start sm:self-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addStock')}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar Component */}
        <ProductSearchBar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          counts={counts}
        />

        {/* Product Table */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-xs">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{p.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{p.barcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-600 font-bold text-[11px] px-2.5 py-1 rounded-md">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{p.sellingPrice}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Cost: ₹{p.purchasePrice}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-extrabold text-xs px-2.5 py-1 rounded-full inline-block ${
                          p.stock <= p.minStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => alert(`Edit ${p.name}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
