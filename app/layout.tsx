import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { fontMono, fontSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";

import { ThemeProvider } from "@/providers/theme-provider";
import SessionProviders from "@/providers/session-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/AuthContext";

import { ThemeAwareLoader } from "@/components/shared/custom-ui/theme-aware-loader";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/contexts/CartContext";
import SignalRProvider from "@/contexts/SingalRContext";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["nextjs", ""],
  authors: [
    {
      name: "",
      url: "",
    },
  ],
  creator: "",
  icons: {
    icon: "/images/icons_favicon/icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeAwareLoader />
          <SessionProviders>
            <QueryProvider>
              <ModalProvider />
              <AuthProvider>
                <SignalRProvider>
                  <CartProvider>{children}</CartProvider>
                </SignalRProvider>
              </AuthProvider>
              <Toaster />
              <HotToaster position="top-center" />
            </QueryProvider>
          </SessionProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
