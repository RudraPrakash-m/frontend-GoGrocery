export const posService = {
  createInvoice: (cartItems, paymentMode) => {
    const invNo = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      invoiceNo: invNo,
      items: cartItems,
      total: totalAmount,
      mode: paymentMode,
      timestamp: new Date().toISOString(),
    };
  },
};
