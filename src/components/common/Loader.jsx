import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Loader - Transparent background loader using the GoGrocery logo.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen=true] - Controls visibility of the loader
 * @param {string} [props.text="Loading..."] - Primary loading text
 * @param {string} [props.subtext] - Secondary description
 * @param {boolean} [props.fullScreen=true] - Fullscreen overlay vs inline container
 * @param {boolean} [props.backdrop=true] - Enables light translucent blur backdrop
 * @param {string} [props.className=""] - Extra container CSS classes
 */
const Loader = ({
  isOpen = true,
  text = 'Loading...',
  subtext,
  fullScreen = true,
  backdrop = true,
  className = '',
}) => {
  if (!isOpen) return null;

  const transparentContent = (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center select-none bg-transparent transition-all animate-fadeIn ${className}`}
    >
      {/* Logo with Smooth Spinning Ring */}
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        {/* Outer Spinning SVG Gradient Ring */}
        <svg
          className="animate-spin w-full h-full text-emerald-600"
          viewBox="0 0 50 50"
          fill="none"
        >
          <circle
            className="opacity-20 stroke-current text-slate-400"
            cx="25"
            cy="25"
            r="20"
            strokeWidth="3.5"
          />
          <circle
            className="stroke-current"
            cx="25"
            cy="25"
            r="20"
            strokeWidth="3.5"
            strokeDasharray="80 150"
            strokeLinecap="round"
          />
        </svg>

        {/* GoGrocery Logo in Center with Soft Pulse */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img
            src="/logo.png"
            alt="GoGrocery"
            className="w-8 h-8 object-contain animate-pulse"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Loading Labels */}
      {(text || subtext) && (
        <div className="space-y-1">
          {text && (
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {text}
            </h3>
          )}
          {subtext && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!fullScreen) {
    return transparentContent;
  }

  const fullScreenOverlay = (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 select-none ${
        backdrop ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      {transparentContent}
    </div>
  );

  if (typeof document === 'undefined') {
    return fullScreenOverlay;
  }

  return createPortal(fullScreenOverlay, document.body);
};

export default Loader;
