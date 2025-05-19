"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatNumberWithDots } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { id } from "date-fns/locale";

interface Location {
	id: number;
	divisi: string;
}

const formSchema = z.object({
	partsName: z.string().min(1, { message: "Nama spare part wajib diisi" }),
	purchaseDate: z.date({
		required_error: "Tanggal pembelian wajib diisi",
	}),
	price: z.string().min(1, { message: "Harga wajib diisi" }),
	toolLocation: z.string().min(1, { message: "Lokasi alat wajib diisi" }),
	toolDate: z.date({
		required_error: "Tanggal alat wajib diisi",
	}),
	image: z.instanceof(File).optional(),
});

export default function SparePartCreate() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [locations, setLocations] = useState<Location[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			partsName: "",
			price: "",
			toolLocation: "",
		},
	});

	useEffect(() => {
		fetchAllLocations();
	}, []);

	// Function to fetch all locations
	async function fetchAllLocations() {
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/divisi/all`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				}
			);

			const result = await response.json();

			if (!response.ok) {
				toast.error(<>Error fetching locations:<br />{result.message}</>);
				return;
			}

			setLocations(result);
		} catch (error) {
			console.error("Error fetching locations:", error);
			toast.error(error instanceof Error ? error.message : 'Error fetching locations');
		}
	}

	async function createSparePart(data: z.infer<typeof formSchema>) {
		const token = Cookies.get("accessToken");
		const formData = new FormData();

		// Add all form fields to FormData
		formData.append("partsName", data.partsName);
		formData.append("purchaseDate", data.purchaseDate.toISOString());
		formData.append("price", data.price);
		formData.append("toolLocation", data.toolLocation);
		formData.append("toolDate", data.toolDate.toISOString());
		formData.append("createdBy", "1"); // Assuming current user ID

		// Add image if present
		if (data.image) {
			formData.append("image", data.image);
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/spareparts/`,
			{
				method: "POST",
				headers: {
					Authorization: token ? `Bearer ${token}` : "",
				},
				body: JSON.stringify({
					partsName: data.partsName,
					purchaseDate: data.purchaseDate.toISOString(),
					price: Number.parseFloat(data.price.replace(/\./g, "")),
					toolLocation: data.toolLocation,
					toolDate: data.toolDate.toISOString(),
				}),
			}
		);

		const result = await response.json();

		if (!response.ok) {
			toast.error(<>Error creating spare part:<br />{result.message}</>);
			return;
		}

		toast.info("Spare part berhasil dibuat");
		router.push("/dashboard/spare-part");
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true);

		try {
			await createSparePart(values);
		} catch (error) {
			console.error("Error creating spare part:", error);
			toast.error(
				error instanceof Error ?
					<>Error creating spare part:<br />{error.message}</> :
					'Error creating spare part'
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/spare-part")}
					className="mr-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Tambah Spare Part
				</span>
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6 mt-4"
				>
					<FormField
						control={form.control}
						name="partsName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nama Spare Part</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan nama spare part"
									/>
								</FormControl>
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
													format(field.value, "PPP")
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
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
								<FormLabel>Tanggal Pembelian</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-full pl-3 text-left font-normal",
													!field.value && "text-muted-foreground"
												)}
											>
												{field.value ? (
													format(field.value, "dd MMM yyyy", { locale: id })
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
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Harga</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan harga"
										type="text"
										value={field.value ? formatNumberWithDots(field.value) : ""}
										onChange={(e) => {
											// Remove non-digit characters and store raw value
											const rawValue = e.target.value.replace(/\./g, "").replace(/[^\d]/g, "");
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
						name="toolLocation"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Lokasi Alat</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Pilih Lokasi Alat" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{locations.map((location) => (
											<SelectItem
												key={location.id}
												value={location.divisi}
											>
												{location.divisi}
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
						name="toolDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Tanggal Alat</FormLabel>
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
													format(field.value, "PPP")
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
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
								<FormLabel>Tanggal Alat</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-full pl-3 text-left font-normal",
													!field.value && "text-muted-foreground"
												)}
											>
												{field.value ? (
													// Format dengan locale Indonesia
													format(field.value, "dd MMM yyyy", { locale: id })
												) : (
													<span>Pilih tanggal</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
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
						name="image"
						render={({ field: { onChange, value, ...field } }) => (
							<FormItem>
								<FormLabel>Gambar Spare Part</FormLabel>
								<FormControl>
									<ImageUpload
										onImageSelect={(file) => onChange(file)}
										className="mt-2"
									/>
								</FormControl>
								<FormMessage />
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