import type {Metadata} from "next";
import "./globals.css";
import Header from "@/app/ui/header";
import {Providers} from "@/app/providers";
import {roboto} from "@/app/ui/fonts";
import config from "@/app/lib/config";
import {auth} from "@/app/lib/auth";

export const metadata: Metadata = {
  title: {
    default: config.appName,
    template: `%s - ${config.appName}`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`min-h-screen ${roboto.className}`}>
        <Providers session={session}>
          <Header/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
