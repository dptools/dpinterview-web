import Providers from "@/app/providers";
import {theme} from "@/app/theme";
import AppHeader from "@/components/app-header";

import {AppSidebar} from "@/components/app-sidebar"
import {SidebarInset, SidebarProvider,} from "@/components/ui/sidebar"
import {Toaster} from "@/components/ui/sonner"
import {AppRouterCacheProvider} from '@mui/material-nextjs/v16-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import React from "react";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const geist = Geist({
    variable: "--font-geist",
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
        <html lang="en" className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <body>
        <AppRouterCacheProvider options={{enableCssLayer: true}}>
            <Providers>
            <ThemeProvider theme={theme}>
                <SidebarProvider>
                    <AppSidebar aria-label={"sidebar"}/>
                    <SidebarInset>
                        <AppHeader/>
                        {children}
                        <Toaster closeButton/>
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
            </Providers>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
