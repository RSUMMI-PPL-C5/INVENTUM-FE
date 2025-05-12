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
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { format, isValid } from "date-fns";
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
	createdOn: z.string().optional(),
});

export default function SparePartEdit() {
	const router = useRouter();
	const { id: sparePartId } = useParams();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [locations, setLocations] = useState<Location[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			partsName: "",
			price: "",
			toolLocation: "",
			createdOn: "",
		}
	});

	useEffect(() => {
		fetchAllLocations();
		fetchSparePart();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sparePartId]);

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

	async function fetchSparePart() {
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparePartId}`,
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
				toast.error(<>Error fetching spare part data:<br />{result.message}</>);
				setLoading(false);
				return;
			}

			const { data: sparePartData } = result;
			console.log("Fetched spare part data:", sparePartData);

			// Parse dates more safely
			const purchaseDate = new Date(sparePartData.purchaseDate);
			const toolDate = new Date(sparePartData.toolDate);
			const createdDate = new Date(sparePartData.createdOn);
			
			const formattedCreatedDate = isValid(createdDate)
				? format(createdDate, "dd-MM-yyyy")
				: "Invalid date";

			// Set form values with explicit type handling
			form.reset({
				partsName: sparePartData.partsName ?? "",
				purchaseDate: isValid(purchaseDate) ? purchaseDate : new Date(),
				price: (sparePartData.price ?? 0).toString(),
				toolLocation: sparePartData.toolLocation ?? "",
				toolDate: isValid(toolDate) ? toolDate : new Date(),
				createdOn: formattedCreatedDate,
			});
            
			console.log("Form values after reset:", form.getValues());
		} catch (error) {
			console.error("Error fetching spare part data:", error);
			toast.error(
				error instanceof Error ? 
				<>Error fetching spare part data:<br />{error.message}</> : 
				'Error fetching spare part data'
			);
		} finally {
			setLoading(false);
		}
	}

	async function updateSparePart(data: z.infer<typeof formSchema>) {
		const token = Cookies.get("accessToken");
		const cleanPrice = data.price.replace(/\./g, "");

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparePartId}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: token ? `Bearer ${token}` : "",
				},
				body: JSON.stringify({
					partsName: data.partsName,
					purchaseDate: data.purchaseDate.toISOString(),
					price: Number.parseFloat(cleanPrice),
					toolLocation: data.toolLocation,
					toolDate: data.toolDate.toISOString(),
				}),
			}
		);

		const result = await response.json();

		if (!response.ok) {
			toast.error(<>Error updating spare part:<br />{result.message}</>);
			return;
		}

		toast.info("Spare part berhasil diperbarui");
		router.push("/dashboard/spare-part");
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setSubmitting(true);

		try {
			await updateSparePart(values);
		} catch (error) {
			console.error("Error updating spare part:", error);
			toast.error(
				error instanceof Error ? 
				<>Error updating spare part:<br />{error.message}</> : 
				'Error updating spare part'
			);
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return <div>Loading...</div>;
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
					Ubah Spare Part
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
											const rawValue = e.target.value.replace(/[^\d.]/g, "");
											const numericValue = rawValue.replace(/\./g, "");
											field.onChange(numericValue);
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
									value={field.value || ""}
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
												{field.value &&
												isValid(field.value) ? (
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
										/>
										<CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
									</div>
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
						<Button type="submit" disabled={submitting}>
							{submitting ? "Menyimpan..." : "Simpan"}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}