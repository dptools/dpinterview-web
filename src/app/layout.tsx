import theme from "@/app/theme";
import AppHeader from "@/components/app-header";
import {AppSidebar} from "@/components/app-sidebar"
import {SidebarInset, SidebarProvider,} from "@/components/ui/sidebar"
import {Toaster} from "@/components/ui/sonner"
import {CssBaseline} from "@mui/material";
import {AppRouterCacheProvider} from '@mui/material-nextjs/v16-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import {ThemeProvider} from '@mui/material/styles';
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {ReactNode} from "react";
import "./globals.css";


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
    children: ReactNode;
}>) {
    return (
        // suppressHydrationWarning required for MUI CSS
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <AppRouterCacheProvider options={{enableCssLayer: true}}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <InitColorSchemeScript attribute="class"/>
                <SidebarProvider>
                    <AppSidebar/>
                    <SidebarInset>
                        <AppHeader/>
                        {children}
                        <Toaster closeButton/>
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
