"use client";

import "@/styles/globals.css";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { NavbarProvider } from "@/context/NavbarContext";
import LayoutContent from "@/components/LayoutContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <NavbarProvider>
            <LayoutContent>{children}</LayoutContent>
          </NavbarProvider>
        </Providers>
      </body>
    </html>
  );
}
