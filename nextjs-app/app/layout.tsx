import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "GigStream - Find Perfect Freelance Services",
    template: "%s | GigStream",
  },
  description:
    "Discover talented freelancers and premium services for your business. From web development to graphic design, find the perfect professional for your project.",
  keywords: [
    "freelance",
    "marketplace",
    "services",
    "gigs",
    "hire freelancers",
    "remote work",
    "digital services",
  ],
  authors: [{ name: "GigStream" }],
  creator: "GigStream",
  publisher: "GigStream",
  metadataBase: new URL("https://gigstream.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gigstream.com",
    title: "GigStream - Find Perfect Freelance Services",
    description:
      "Discover talented freelancers and premium services for your business.",
    siteName: "GigStream",
  },
  twitter: {
    card: "summary_large_image",
    title: "GigStream - Find Perfect Freelance Services",
    description:
      "Discover talented freelancers and premium services for your business.",
    creator: "@gigstream",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
