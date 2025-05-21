"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MaintenanceRequestEdit() {
	const router = useRouter();

	// This is a placeholder component that will be implemented later
	// Adding responsive framework to be used when fully implemented
	return (
		<div className="space-y-6">
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={() => router.back()}
					className="mr-4 w-full sm:w-auto"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Edit Permintaan Maintenance
				</span>
			</div>

			{/* Form placeholder with responsive structure */}
			<div className="max-w-3xl">
				<p>Form maintenance request akan diimplementasikan nanti</p>

				{/* Example of responsive action buttons */}
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end mt-6">
					<Button
						type="button"
						variant="destructive"
						onClick={() => router.back()}
						className="w-full sm:w-auto order-1 sm:order-none"
					>
						Batalkan
					</Button>
					<Button type="button" className="w-full sm:w-auto">
						Simpan
					</Button>
				</div>
			</div>
		</div>
	);
}
