/**
 * Route Preloader Utility
 * Preloads React lazy-loaded route components in idle background time
 * to enable instant (0ms) tab switching without Suspense loader flashes.
 */

// Route chunk import functions
const routeLoaders = {
  DashboardPage: () => import('../../features/dashboard/pages/DashboardPage'),
  POSPage: () => import('../../features/pos/pages/POSPage'),
  ProductsPage: () => import('../../features/products/pages/ProductsPage'),
  AddStockPage: () => import('../../features/inventory/pages/AddStockPage'),
  SalesPage: () => import('../../features/sales/pages/SalesPage'),
  ReportsPage: () => import('../../features/reports/pages/ReportsPage'),
  SettingsPage: () => import('../../features/settings/pages/SettingsPage'),
  HelpPage: () => import('../../features/help/pages/HelpPage'),
  MorePage: () => import('../../features/more/pages/MorePage'),
};

let preloaded = false;

/**
 * Silently preloads all main application routes during idle browser time.
 */
export const preloadAllRoutes = () => {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;

  const preloadFn = () => {
    Object.values(routeLoaders).forEach((loader) => {
      try {
        loader();
      } catch (e) {
        // Silently ignore background preloader errors
      }
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadFn, { timeout: 2000 });
  } else {
    setTimeout(preloadFn, 300);
  }
};

export default preloadAllRoutes;
