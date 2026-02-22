import type { Metadata } from "next";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/contexts/theme-context";
import { ThemeScript } from "@/lib/theme-script";
import { Toaster } from "sonner";
import "./globals.css";

const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Brigada CMS - Admin Panel",
  description: "Administrative control panel for Brigada survey system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${fontBody.variable} ${fontDisplay.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
