import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import AppHeader from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AV - Web",
  description: "AV pipeline web companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSidebar aria-label={"sidebar"}/>
          <SidebarInset>
            <AppHeader />
            {/* <ThemeRegistry options={{ key: 'joy' }}> */}
            {children}
            {/* </ThemeRegistry> */}
            <Toaster closeButton />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
