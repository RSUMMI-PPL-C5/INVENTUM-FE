"use client";

import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDate, formatNumberWithDots } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { id } from "date-fns/locale";

// Schema validasi menggunakan Zod
const formSchema = z.object({
	inventorisId: z.string().min(1, { message: "Inventoris ID wajib diisi" }),
	name: z.string().min(1, { message: "Nama alat wajib diisi" }),
	brandName: z.string().optional(),
	modelName: z.string().optional(),
	purchaseDate: z
		.date({ required_error: "Tanggal pembelian wajib diisi" })
		.refine((date) => date <= new Date(), {
			message: "Tanggal pembelian tidak boleh lebih dari hari ini",
		})
		.optional(),
	purchasePrice: z
		.string()
		.optional()
		.transform((val) => (val === "" ? undefined : Number(val)))
		.refine((val) => val === undefined || !isNaN(val), {
			message: "Harga pembelian harus berupa angka",
		})
		.refine((val) => val === undefined || val >= 0, {
			message: "Harga tidak boleh kurang dari 0",
		}),
	status: z.string().min(1, { message: "Status wajib diisi" }),
	vendor: z.string().optional(),
	lastLocation: z.string().optional(),
	createdOn: z.string().optional(),
	modifiedOn: z.string().optional(),
});

// Daftar status alat medis
const equipmentStatus = [
	{ id: "Active", name: "Active" },
	{ id: "Inactive", name: "Inactive" },
	{ id: "Maintenance", name: "Maintenance" },
];

export default function MedicalEquipmentEdit() {
	const router = useRouter();
	const { id: equipmentId } = useParams();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	useEffect(() => {
		async function fetchMedicalEquipment() {
			try {
				const token = Cookies.get("accessToken");

				const headers: Record<string, string> = {
					"Content-Type": "application/json",
				};

				if (token) {
					headers.Authorization = `Bearer ${token}`;
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
					{
						headers,
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					toast.error(
						<>
							Error mengambil data alat medis:
							<br />
							{errorData.message ?? "Gagal mengambil data"}
						</>
					);
					throw new Error("Failed to fetch medical equipment data");
				}

				const { data: equipmentData } = await response.json();

				// Convert string dates to Date objects where needed
				const purchaseDate = equipmentData.purchaseDate
					? parseISO(equipmentData.purchaseDate)
					: undefined;

				const formattedCreatedDate = equipmentData.createdOn
					? formatDate(equipmentData.createdOn)
					: "Tidak tersedia";

				const formattedModifiedDate = equipmentData.modifiedOn
					? formatDate(equipmentData.modifiedOn)
					: "Tidak tersedia";

				form.reset({
					inventorisId: equipmentData.inventorisId,
					name: equipmentData.name,
					brandName: equipmentData.brandName ?? "",
					modelName: equipmentData.modelName ?? "",
					purchaseDate: purchaseDate,
					purchasePrice: equipmentData.purchasePrice
						? equipmentData.purchasePrice.toString()
						: "",
					status: equipmentData.status,
					vendor: equipmentData.vendor ?? "",
					lastLocation: equipmentData.lastLocation ?? "",
					createdOn: formattedCreatedDate,
					modifiedOn: formattedModifiedDate,
				});
			} catch (error) {
				console.error("Error fetching medical equipment data:", error);
				toast.error(
					error instanceof Error ? (
						<>
							Error mengambil data:
							<br />
							{error.message}
						</>
					) : (
						"Error mengambil data alat medis"
					)
				);
			} finally {
				setLoading(false);
			}
		}

		fetchMedicalEquipment();
	}, [equipmentId, form]);

	async function updateMedicalEquipment(data: z.infer<typeof formSchema>) {
		const token = Cookies.get("accessToken");

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${equipmentId}`,
			{
				method: "PUT",
				headers,
				body: JSON.stringify({
					inventorisId: data.inventorisId,
					name: data.name,
					brandName: data.brandName ?? null,
					modelName: data.modelName ?? null,
					purchaseDate: data.purchaseDate
						? data.purchaseDate.toISOString()
						: null,
					purchasePrice: data.purchasePrice
						? Number(data.purchasePrice)
						: null,
					status: data.status,
					vendor: data.vendor ?? null,
					lastLocation: data.lastLocation ?? null,
				}),
			}
		);

		const result = await response.json();

		if (!response.ok) {
			toast.error(
				<>
					Error mengubah data alat medis:
					<br />
					{result.message ?? "Gagal mengubah data"}
				</>
			);
			return;
		}

		toast.success("Data alat medis berhasil diperbarui");
		return result;
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setSubmitting(true);

		try {
			const result = await updateMedicalEquipment(values);
			if (result) {
				router.push("/dashboard/medical-equipment");
			}
		} catch (error) {
			console.error("Failed to update medical equipment:", error);
			toast.error(
				error instanceof Error ? (
					<>
						Error mengubah data:
						<br />
						{error.message}
					</>
				) : (
					"Error mengubah data alat medis"
				)
			);
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	const getStatusText = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "Aktif";
			case "inactive":
				return "Tidak Aktif";
			case "maintenance":
				return "Pemeliharaan";
			default:
				return status;
		}
	};

	return (
		<>
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/medical-equipment")}
					className="mr-4 w-full sm:w-auto"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Ubah Alat Medis
				</span>
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6 mt-4 max-w-3xl"
				>
					<FormField
						control={form.control}
						name="inventorisId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Inventoris ID</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan Inventoris ID"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nama Alat</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan nama alat medis"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="brandName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Brand</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan merk"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="modelName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Model</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan model"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="purchasePrice"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Harga Pembelian</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan harga pembelian"
										type="text"
										value={
											field.value
												? formatNumberWithDots(
														field.value.toString()
												  )
												: ""
										}
										onChange={(e) => {
											const rawValue = e.target.value
												.replace(/[^\d.]/g, "")
												.replace(/\./g, "");
											field.onChange(rawValue);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="vendor"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Vendor</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan vendor"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastLocation"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Lokasi Terakhir</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan lokasi terakhir"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Pilih Status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{equipmentStatus.map((status) => (
											<SelectItem
												key={status.id}
												value={status.id}
											>
												{getStatusText(status.id)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="purchaseDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Tanggal Pembelian</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-full pl-3 text-left font-normal",
													!field.value &&
														"text-muted-foreground"
												)}
											>
												{field.value ? (
													format(
														field.value,
														"d MMM yyyy",
														{ locale: id }
													)
												) : (
													<span>Pilih tanggal</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="start"
									>
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											initialFocus
											locale={id}
											weekStartsOn={1}
											className="rounded-md border"
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="createdOn"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Tanggal Dibuat</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											{...field}
											aria-label="Tanggal Dibuat"
											disabled
											value={
												field.value ?? "Tidak tersedia"
											}
										/>
										<CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="modifiedOn"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Tanggal Dimodifikasi</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											{...field}
											aria-label="Tanggal Dimodifikasi"
											disabled
											value={
												field.value ?? "Tidak tersedia"
											}
										/>
										<CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
						<Button
							type="button"
							variant="destructive"
							onClick={() => router.back()}
							className="w-full sm:w-auto order-1 sm:order-none"
						>
							Batalkan
						</Button>
						<Button
							type="submit"
							disabled={submitting}
							className="w-full sm:w-auto"
						>
							{submitting ? "Menyimpan..." : "Simpan"}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
