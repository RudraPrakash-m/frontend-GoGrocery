export const inventoryService = {
  generateBarcode: (productName) => {
    const code = `SG${Math.floor(100000 + Math.random() * 900000)}`;
    return code;
  },
};
