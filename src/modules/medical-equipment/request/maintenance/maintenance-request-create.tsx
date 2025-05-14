"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

const formSchema = z.object({
	medicalEquipment: z.string().min(1),
	complaint: z.string().optional(),
});

export default function MaintenanceRequestCreate() {
	const router = useRouter();
	const params = useParams();
	const equipmentId = params.id as string;
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [errorModalOpen, setErrorModalOpen] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			medicalEquipment: "",
			complaint: "",
		},
	});

	const getToken = useCallback(() => {
		const token = Cookies.get("accessToken");
		if (!token) throw new Error("No token found");
		return token;
	}, []);

	const createMaintenanceRequest = async (
		data: z.infer<typeof formSchema>
	) => {
		try {
			const token = await getToken();

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/request/maintenance`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(data),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to create maintenance request");
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Error creating maintenance request:", error);
			throw error;
		}
	};

	const onsubmit = async (data: z.infer<typeof formSchema>) => {
		setLoading(true);
		setError(null);

		try {
			await createMaintenanceRequest({ ...data });
			router.push(
				`/dashboard/medical-equipment/${equipmentId}?success=true`
			);
		} catch (error) {
            console.error("Failed to create maintenance request:", error);
			setError("Failed to create maintenance request");
			setErrorModalOpen(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		async function fetchMedicalEquipmentName() {
			setLoading(true);
			try {
				const token = await getToken();

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch medical equipment name");
				}

				const data = await response.json();
				form.setValue("medicalEquipment", data.data.name);
			} catch (error) {
				console.error("Error fetching medical equipment name:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchMedicalEquipmentName();
	}, [equipmentId, form, getToken]);

	return (
		<>
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={() => router.back()}
					className="mr-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Minta Maintenance
				</span>
			</div>

			{error && <div className="text-red-500 mt-2">{error}</div>}
			{errorModalOpen && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
					<span className="block sm:inline">{error}</span>
					<span
						className="absolute top-0 bottom-0 right-0 px-4 py-3"
						onClick={() => setErrorModalOpen(false)}
					>
						<svg
							className="fill-current h-6 w-6 text-red-500"
							role="button"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
						>
							<title>Close</title>
							<path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
						</svg>
					</span>
				</div>
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onsubmit)}
					className="space-y-6 mt-4"
				>
					<FormField
						control={form.control}
						name="medicalEquipment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Alat</FormLabel>
								<FormControl>
									<Input
										disabled
										placeholder="Loading..."
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="complaint"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Catatan</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Masukkan keluhan"
										className="min-h-[100px]"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<div className="flex justify-end space-x-4">
						<Button
							type="button"
							variant="destructive"
							onClick={() => router.back()}
						>
							Batalkan
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Menyimpan..." : "Simpan"}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
