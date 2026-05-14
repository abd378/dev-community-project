import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevHub",
  description: "Developer community platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="particles">
          <span style={{ left: "8%", animationDuration: "14s" }}></span>
          <span style={{ left: "18%", animationDuration: "18s" }}></span>
          <span style={{ left: "30%", animationDuration: "20s" }}></span>
          <span style={{ left: "45%", animationDuration: "16s" }}></span>
          <span style={{ left: "60%", animationDuration: "22s" }}></span>
          <span style={{ left: "75%", animationDuration: "19s" }}></span>
          <span style={{ left: "90%", animationDuration: "24s" }}></span>
        </div>

        <Navbar />

        <main className="site-content">{children}</main>

        <footer>
          <p>© 2026 DevHub. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}