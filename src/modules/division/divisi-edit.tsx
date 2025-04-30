/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";

interface Division {
	id: number;
	divisi: string;
	parentId: number | null;
	children?: Division[];
}

const formSchema = z.object({
	divisi: z.string().min(1, { message: "Nama divisi wajib diisi" }),
	parentId: z.string().optional(),
});

interface EditDivisiProps {
	readonly id: number;
}

export default function EditDivisi({ id }: EditDivisiProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [loadingDivision, setLoadingDivision] = useState(true);
	const [parentDivisions, setParentDivisions] = useState<Division[]>([]);
	const [errorModalOpen, setErrorModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			divisi: "",
			parentId: undefined,
		},
	});

	useEffect(() => {
		// Fetch the division to edit and all potential parent divisions
		Promise.all([fetchDivision(id), fetchAllDivisions()]);
	}, [id]);

	async function fetchDivision(id: number) {
		try {
			setLoadingDivision(true);
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/divisi/${id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				}
			);

			const data = await response.json();

			// Set form values
			form.setValue("divisi", data.divisi);
			form.setValue(
				"parentId",
				data.parentId ? data.parentId.toString() : "none"
			);
		} catch (err) {
			console.error("Error fetching division:", err);
			setErrorMessage("Failed to load division data.");
			setErrorModalOpen(true);
		} finally {
			setLoadingDivision(false);
		}
	}

	async function fetchAllDivisions() {
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
			// Filter out the current division and its children to prevent circular references
			const filteredDivisions = flattenAndFilterDivisions(data, id);
			setParentDivisions(filteredDivisions);
		} catch (err) {
			console.error("Error fetching divisions:", err);
			setErrorMessage("Failed to load parent divisions.");
			setErrorModalOpen(true);
		}
	}

	// Function to flatten divisions and filter out the current one and its descendants
	function flattenAndFilterDivisions(
		divisions: Division[],
		currentId: number
	): Division[] {
		let result: Division[] = [];

		for (const division of divisions) {
			// Skip the current division and its children
			if (division.id !== currentId) {
				result.push(division);
				if (division.children && division.children.length > 0) {
					result = [
						...result,
						...flattenAndFilterDivisions(
							division.children,
							currentId
						),
					];
				}
			}
		}

		return result;
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");

			// Convert parentId to number or null
			const payload = {
				divisi: values.divisi,
				parentId:
					values.parentId && values.parentId !== "none"
						? parseInt(values.parentId)
						: null,
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/divisi/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update division");
			}

			toast({
				title: "Success",
				description: "Division updated successfully",
			});

			// Navigate back to division list
			router.push("/dashboard/division");
		} catch (err) {
			console.error("Error updating division:", err);
			setErrorMessage(
				"Gagal mengupdate divisi. Silakan cek kembali cek kembali nama divisi dan parent divisi yang dipilih."
			);
			setErrorModalOpen(true);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/division")}
					className="mr-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Edit Divisi
				</span>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Form Edit Divisi</CardTitle>
				</CardHeader>
				<CardContent>
					{loadingDivision ? (
						<div className="flex justify-center items-center">
							<span>Loading divisions data...</span>
						</div>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									control={form.control}
									name="divisi"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama Divisi</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nama divisi"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="parentId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Parent Divisi</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Pilih parent divisi (opsional)" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="none">
														Tidak Ada Parent
													</SelectItem>
													{parentDivisions.map(
														(division) => (
															<SelectItem
																key={
																	division.id
																}
																value={division.id.toString()}
															>
																{
																	division.divisi
																}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
											<FormDescription>
												Pilih parent divisi jika
												merupakan sub divisi
											</FormDescription>
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
					)}
				</CardContent>
			</Card>

			{errorModalOpen && (
				<Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
					<DialogContent className="max-w-md w-full">
						<DialogHeader>
							<DialogTitle>Error</DialogTitle>
							<DialogDescription>
								{errorMessage}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={() => setErrorModalOpen(false)}>
								Tutup
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
