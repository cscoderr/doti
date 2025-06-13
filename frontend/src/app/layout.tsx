import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/utils/wagmi";
import Layout from "@/components/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    wagmiConfig(),
    (await headers()).get("cookie")
  );
  return (
    <html lang="en">
      <body
        className={`${bricolageGrotesque.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialState={initialState}>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
