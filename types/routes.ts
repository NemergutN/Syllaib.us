export type AppRoutes = "/" | "/dashboard" | "/landing" | "/login" | "/register" | "/upload";
export type LayoutRoutes = "/";

export type ParamMap = {
  "/": Record<string, never>;
  "/dashboard": Record<string, never>;
  "/landing": Record<string, never>;
  "/login": Record<string, never>;
  "/register": Record<string, never>;
  "/upload": Record<string, never>;
};
