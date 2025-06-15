import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./style/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NavWrapper from "./components/layout/NavWrapper";
 import { ThemeProvider } from "next-themes";
   
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sheraton",
  description: "Sheraton is a trusted investment company offering innovative financial solutions, secure wealth management, and real-time market opportunities tailored for growth.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>            
            {children}
          </ThemeProvider>
        </AuthProvider>
        <NavWrapper /> 
        </body>
     </html>
  );
}
