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
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Add the Location type at the top of the file, after imports
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
});

export default function SparePartCreate() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [locations, setLocations] = useState<Location[]>([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [errorModalOpen, setErrorModalOpen] = useState(false);

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

			const data = await response.json();
			console.log(data);
			setLocations(data);
		} catch (err) {
			console.error("Error fetching locations:", err);
			setErrorMessage("Failed to load parent divisions.");
			setErrorModalOpen(true);
		}
	}

	async function createSparePart(data: z.infer<typeof formSchema>) {
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/spareparts/`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify({
						partsName: data.partsName,
						purchaseDate: data.purchaseDate.toISOString(),
						price: Number.parseFloat(data.price),
						toolLocation: data.toolLocation,
						toolDate: data.toolDate, // Format as string in yyyy-MM-dd format
						createdBy: 1, // Assuming current user ID
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to create spare part");
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Error creating spare part:", error);
			throw error;
		}
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true);
		setError(null);

		try {
			await createSparePart(values);
			router.push("/dashboard/spare-part?success=create");
		} catch (error) {
			console.error("Failed to create spare part:", error);
			setError("Gagal membuat spare part. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<span className="text-header-h5 font-bold font-poppins">
				Tambah Spare Part
			</span>

			{error && <div className="text-red-500 mt-2">{error}</div>}
			{errorModalOpen && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
					<span className="block sm:inline">{errorMessage}</span>
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
										type="number"
										onChange={(e) =>
											field.onChange(e.target.value)
										}
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
