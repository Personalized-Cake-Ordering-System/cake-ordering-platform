export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Cake Platform",
  description: "Cake Platform",
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "http://localhost:3000",
  links: { github: "" },
};
