import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
// import { SocketProvider } from "../context/SocketContext"; // Removed in favor of Firestore

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "100 Bingo",
  description: "Multiplayer Bingo Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
