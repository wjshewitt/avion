import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ProfileProvider } from "@/components/providers/ProfileProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";

const geistSans = Geist({
 variable:"--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable:"--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title:"FlightChat",
 description:"AI-powered flight operations and booking platform",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 // Anti-flash script - prevents FOUC by setting theme before React hydration
 const antiFlashScript = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var resolvedTheme = theme === 'system' ? systemTheme : (theme || 'light');
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      } catch (e) {
        // Fallback to light theme
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();
  `;

 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
 </head>
 <body
 className={`${geistSans.variable} ${geistMono.variable} antialiased`}
 >
 <ThemeProvider>
 <Providers>
 <ProfileProvider>{children}</ProfileProvider>
 </Providers>
 <Toaster />
 </ThemeProvider>
 </body>
 </html>
 );
}
