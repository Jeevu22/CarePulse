import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-playfair",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "PULSEWATCH — Dashboard Overview",
  description: "Real-time health risk insights and predictive analysis.",
};

import { DeviceProfileProvider } from "@/components/DeviceProfileContext";
import UserProfileModal from "@/components/UserProfileModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} font-sans antialiased`}
      >
        <DeviceProfileProvider>
          {children}
          <UserProfileModal />
        </DeviceProfileProvider>
      </body>
    </html>
  );
}
