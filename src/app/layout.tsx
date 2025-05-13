import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { ErrorBoundaryWrapper } from '@/components/error-boundary';

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
                    <ErrorBoundaryWrapper fallback={<div>Something went wrong</div>}>
                        {children}
                    </ErrorBoundaryWrapper>
                    <Toaster position="top-center" richColors/>
                </body>
            </Suspense>
		</html>
	);
}
