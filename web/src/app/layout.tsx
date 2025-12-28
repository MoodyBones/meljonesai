import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mel Jones | Career Applications",
  description: "Personalised career narratives and application pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
