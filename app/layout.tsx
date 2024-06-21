import type { Metadata } from "next";
import {Roboto} from 'next/font/google'
import "./globals.css";
import Header from "@/app/ui/header";
import {Providers} from "@/app/providers";

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kudoz",
    template: `%s - Kudoz`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${roboto.className}`}>
        <Providers>
          <Header/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
