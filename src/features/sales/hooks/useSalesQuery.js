import { useQuery } from '@tanstack/react-query';
import { salesService } from '../services/salesService';

export const SALES_QUERY_KEYS = {
  all: ['sales'],
  list: (tab, search) => ['sales', { tab, search }],
  metrics: ['sales', 'metrics'],
  invoice: (invoiceNo) => ['sales', 'invoice', invoiceNo],
};

/**
 * Hook to fetch sales history with tab filtering & search
 */
export const useSalesHistory = ({ tab = 'all', search = '' } = {}) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.list(tab, search),
    queryFn: () => salesService.getSalesHistory({ tab, search }),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to fetch full invoice details for View Bill / Thermal Receipt
 */
export const useInvoiceDetails = (invoiceNo, { enabled = true } = {}) => {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.invoice(invoiceNo),
    queryFn: () => salesService.getSaleByInvoiceNo(invoiceNo),
    enabled: Boolean(invoiceNo) && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
