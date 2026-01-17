import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Sketch - Interactive Lecture Visualization",
  description: "Live lecture visualization tool using LiveKit and ReactFlow for enhanced learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
