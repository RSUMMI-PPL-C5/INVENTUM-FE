import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "INVENTUM",
  description: "Inventori Terpadu RS UMMI",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
            <Suspense>
                <body>
                    {children}
                    <Toaster position="top-center" richColors/>
                </body>
            </Suspense>
		</html>
	);
}
