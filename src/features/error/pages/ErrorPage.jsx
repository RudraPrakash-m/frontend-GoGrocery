import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = error?.status || 404;
  const statusText = error?.statusText || 'Page Not Found';
  const message = error?.data || error?.message || "The page you are looking for doesn't exist or has been moved.";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 max-w-md w-full text-center space-y-6 shadow-xl">
        {/* Store Logo & Error Badge */}
        <div className="space-y-2">
          <img
            src="/logo.png"
            alt="GoGrocery Logo"
            className="w-16 h-16 object-contain mx-auto mb-2"
          />
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
          </div>
        </div>

        {/* Error Details */}
        <div className="space-y-1">
          <span className="text-xs font-extrabold font-mono text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
            Error {status}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
            {statusText}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed pt-1">
            {message}
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
