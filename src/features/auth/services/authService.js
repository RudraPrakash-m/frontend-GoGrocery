export const authService = {
  login: async (mobile, pin) => {
    // Simulated mock API call for login
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            name: 'Kirana Store Admin',
            mobile,
            storeName: 'GoGrocery Superstore',
          },
          token: 'demo_jwt_token_gogrocery_2026',
        });
      }, 300);
    });
  },
};
