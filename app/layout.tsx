import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ToastContainer from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Medora — Medical Report Summarizer",
  description: "Hospital Dashboard for managing patients, records, and doctors",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} antialiased`}>
        <ErrorBoundary>
          <AppProvider>
            {children}
            <ToastContainer />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
