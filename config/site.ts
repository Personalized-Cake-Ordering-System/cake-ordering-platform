export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Cake Platform",
  description: "Cake Platform",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://movemate-dashboard.vercel.app",
  links: { github: "https://github.com/vinhnt2002/movemate-dashboard" },
};
