import type { Metadata } from "next";
import {Roboto} from 'next/font/google'
import "./globals.css";
import Header from "@/app/ui/header";

const roboto = Roboto({
  weight: '400',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kudoz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Header/>
        {children}
      </body>
    </html>
  );
}
