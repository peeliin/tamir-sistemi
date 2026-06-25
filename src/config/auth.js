/** Admin girişi — .env ile özelleştirilebilir (REACT_APP_ADMIN_USER / REACT_APP_ADMIN_PASS) */
export const ADMIN_USER = process.env.REACT_APP_ADMIN_USER || "admin";
export const ADMIN_PASS = process.env.REACT_APP_ADMIN_PASS || "admin123";

export const ADMIN_SESSION_KEY = "adminLoggedIn";
export const CUSTOMER_SESSION_KEY = "customerDeviceId";
