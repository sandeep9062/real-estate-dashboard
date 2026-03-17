import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"] });
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Dashboard - Property Bulbul",
  description: "Manage your real estate listings with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/bulbul-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "PropertyBulbul",
              url: "https://propertybulbul.com",
              logo: "https://propertybulbul.com/propertybulbul.png",
              address: {
                "@type": "PostalAddress",
                streetAddress: "145 PropertyBulbul",
                addressLocality: "chandigarh",
                addressRegion: "CA",
                postalCode: "90210",
                addressCountry: "IN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+919729907448",
                contactType: "customer service",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Toaster position="top-right" richColors closeButton expand />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
