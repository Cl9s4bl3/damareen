import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Damareen",
  description: "A Damareen játék újragondolva",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body>
      <main>{children}</main>
      <Toaster
          position="bottom-right"
          duration={4000}
          expand={true}
          visibleToasts={5}
          closeButton
          richColors
          theme="dark"
      />
      </body>
      </html>
  );
}
