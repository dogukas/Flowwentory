import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flowventory",
  description: "Modern Enterprise Resource Planning System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flowventory",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f172a",
};

import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DictionaryProvider } from "@/lib/i18n/DictionaryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { Locale } from "@/lib/i18n/config";
import { i18n } from "@/lib/i18n/config";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  const locale = localeCookie || i18n.defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ErrorBoundary>
          <DictionaryProvider initialLocale={locale} initialDictionary={dictionary}>
            <ClientLayout>{children}</ClientLayout>
          </DictionaryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
