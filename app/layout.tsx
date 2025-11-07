import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meauxbility Cloud - Internal Company Workspace",
  description: "Internal email, facetime, streaming, dashboard, and company workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
