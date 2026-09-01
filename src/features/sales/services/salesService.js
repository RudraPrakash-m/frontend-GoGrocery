import apiClient from '../../../services/api/axiosInstance';
import { encryptPayload } from '../../../security/encryption/cryptoService';

export const salesService = {
  /**
   * Fetch all saved store invoices (supports tab filtering: tab=all, tab=upi, tab=cash, tab=card & search)
   */
  getSalesHistory: async ({ tab = 'all', search = '' } = {}) => {
    try {
      const response = await apiClient.get('/sales', {
        params: { tab, search },
      });
      return response.data;
    } catch (_err) {
      return {
        success: false,
        summary: { totalSales: 0, totalBills: 0, cashSales: 0, upiSales: 0, cardSales: 0 },
        data: [],
      };
    }
  },

  /**
   * Fetch live sales summary metrics (totalSales, totalBills)
   */
  getSalesMetrics: async () => {
    try {
      const response = await apiClient.get('/sales/metrics');
      return response.data;
    } catch (_err) {
      return { success: false, totalSales: 0, totalBills: 0 };
    }
  },

  /**
   * Fetch full invoice breakdown merged with Store Header details
   */
  getSaleByInvoiceNo: async (invoiceNo) => {
    try {
      const response = await apiClient.get(`/sales/invoice/${invoiceNo}`);
      return response.data;
    } catch (_err) {
      return { success: false, data: null };
    }
  },

  /**
   * Finalize POS sale with AES-256 encrypted payload fallback
   */
  createSale: async (saleData) => {
    const encryptedPayload = encryptPayload(saleData);
    try {
      const response = await apiClient.post('/sales', encryptedPayload);
      return response.data;
    } catch (err) {
      if (err?.response?.data?.message?.includes('expected string')) {
        try {
          const response = await apiClient.post('/sales', saleData);
          return response.data;
        } catch (_innerErr) {
          return saleData;
        }
      }
      return saleData;
    }
  },
};

export default salesService;
