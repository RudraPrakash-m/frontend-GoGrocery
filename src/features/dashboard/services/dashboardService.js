export const dashboardService = {
  getStats: () => ({
    todaysSales: 8450,
    todaysOrders: 126,
    totalProducts: 15,
    lowStockCount: 3,
  }),
  getLowStockItems: () => [
    { id: 1, name: 'Amul Milk 1L', barcode: '8901234512340', stockLeft: 3, unit: 'Litre' },
    { id: 2, name: 'Britannia Bread', barcode: '8901234511111', stockLeft: 5, unit: 'Pack' },
    { id: 3, name: 'Sugar 1Kg', barcode: '8901234599999', stockLeft: 4, unit: 'Kg' },
  ],
};
