import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Invoice Pro — Gestion commerciale pour PME africaines",
  description: "Gérez vos factures, votre stock et vos finances en un seul endroit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="fr"
        className={`${jakarta.variable} h-full antialiased scroll-smooth`}
        data-theme="light"
      >
        <body className={`${jakarta.className} min-h-full flex flex-col bg-base-100`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}