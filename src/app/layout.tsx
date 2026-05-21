import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Vendor Event Intelligence`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "VendorEventsHub is a vendor intelligence platform helping vendors compare festivals, craft fairs, flea markets, and farmers markets before applying.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.vendoreventshub.com"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Vendor Event Intelligence`,
    description:
      "Compare vendor events, booth fees, traffic signals, and organizer trust before you apply.",
    images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Vendor Event Intelligence`,
    description:
      "Compare vendor events, booth fees, traffic signals, and organizer trust before you apply.",
    images: [absoluteUrl("/og-image.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
  <Navbar />
  {children}
  <Footer />
</body>
    </html>
  );
}