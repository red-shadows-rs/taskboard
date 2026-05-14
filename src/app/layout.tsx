import "./globals.css";

import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";

import { DynamicMetadata } from "@/components/common/metadataCommon";
import { ThemeProvider } from "@/components/common/settingsCommon";
import { ScrollToTop } from "@/components/ui/scrollToTopUi";
import { LanguageProvider } from "@/contexts/languageContext";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskBoard - Task Management System",
  description: "Professional task management system for teams and managers",
  icons: {
    icon: [
      { url: "/favicon.webp", sizes: "32x32", type: "image/webp" },
      { url: "/icon-16.webp", sizes: "16x16", type: "image/webp" },
      { url: "/icon-32.webp", sizes: "32x32", type: "image/webp" },
      { url: "/icon-192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon-512.webp", sizes: "512x512", type: "image/webp" },
    ],
    shortcut: "/favicon.webp",
    apple: [
      { url: "/apple-touch-icon.webp", sizes: "180x180", type: "image/webp" },
    ],
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("language")?.value || "en";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/css/font-awesome.min.css" />
        <link rel="icon" href="/favicon.webp" sizes="32x32" />
        <link
          rel="icon"
          href="/icon-192.webp"
          type="image/webp"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.webp"
          sizes="180x180"
        />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider defaultTheme="dark" storageKey="taskboard-theme">
          <LanguageProvider>
            <DynamicMetadata />
            {children}
            <ScrollToTop />
            <Toaster
              position="top-right"
              toastOptions={{
                className: "",
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
                success: {
                  iconTheme: {
                    primary: "hsl(var(--primary))",
                    secondary: "hsl(var(--primary-foreground))",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "hsl(var(--destructive))",
                    secondary: "hsl(var(--destructive-foreground))",
                  },
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
