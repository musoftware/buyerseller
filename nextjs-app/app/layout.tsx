import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <GoogleAnalytics />
        <Providers>
          <Navbar
            isAuthenticated={!!session}
            userRole={(session?.user as any)?.role}
            userId={(session?.user as any)?.id}
          />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
