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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, decodeToken } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";

// Add the Division type at the top of the file, after imports
interface Division {
	id: number;
	divisi: string;
}

const formSchema = z.object({
	nokar: z.string().min(1, { message: "No. Kar wajib diisi" }),
	fullname: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
	username: z.string().min(1, { message: "Username wajib diisi" }),
	email: z
		.string()
		.email({ message: "Format email tidak valid" })
		.min(1, { message: "Email wajib diisi" }),
	password: z.string().min(6, { message: "Password minimal 6 karakter" }),
	divisiId: z.string().min(1, { message: "Divisi wajib diisi" }),
	role: z.string().min(1, { message: "Role wajib diisi" }),
	waNumber: z.string().min(1, { message: "No. WA wajib diisi" }),
	entryDate: z.date({
		required_error: "Tanggal masuk wajib diisi",
	}),
});

const roles = [
	{ id: "1", name: "User" },
	{ id: "2", name: "Fasum" },
	{ id: "3", name: "Admin" },
];

export default function UserCreate() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [divisions, setDivisions] = useState<Division[]>([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [errorModalOpen, setErrorModalOpen] = useState(false);

	useEffect(() => {
		fetchAllDivisions();
	}, []);

	// Update the fetchAllDivisions function to use the proper typing
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
			console.log(data);
			setDivisions(data);
		} catch (err) {
			console.error("Error fetching divisions:", err);
			setErrorMessage("Failed to load parent divisions.");
			setErrorModalOpen(true);
		}
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nokar: "",
			fullname: "",
			username: "",
			email: "",
			password: "",
			divisiId: "",
			role: "",
			waNumber: "",
		},
	});

	async function createUser(data: z.infer<typeof formSchema>) {
		try {
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/user/`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify({
						username: data.username,
						email: data.email,
						password: data.password,
						role: data.role,
						fullname: data.fullname,
						nokar: data.nokar,
						divisiId: Number.parseInt(data.divisiId),
						waNumber: data.waNumber,
					}),
				}
			);

            if (!response.ok) {
                const result = await response.json();
                toast.error('Error creating user', result.message);
                return
			}

			const result = await response.json();

			return result;
		} catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error creating user');
		}
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true);
		setError(null);

		try {
			await createUser(values);
			router.push("/dashboard/user?success=create");
		} catch (error) {
			console.error("Failed to create user:", error);
			setError("Gagal membuat pengguna. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<div className="flex flex-col items-start gap-4">
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/user")}
					className="mr-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali
				</Button>
				<span className="text-header-h5 font-bold font-poppins">
					Tambah Pengguna
				</span>
			</div>

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
						name="nokar"
						render={({ field }) => (
							<FormItem>
								<FormLabel>No. Karyawan</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan nomor karyawan"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="fullname"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nama Lengkap</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan nama lengkap"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="waNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>No. WA</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan nomor WA"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Masukkan username"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										{...field}
										placeholder="Masukkan alamat email"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										{...field}
										placeholder="Masukkan password"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="divisiId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Divisi</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Pilih Divisi" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{/* Update the division mapping in the Select component to use the proper structure */}
										{divisions.map((division) => (
											<SelectItem
												key={division.id}
												value={division.id.toString()}
											>
												{division.divisi}
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
						name="role"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Role</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Pilih Role" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{roles.map((role) => (
											<SelectItem
												key={role.id}
												value={role.name}
											>
												{role.name}
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
						name="entryDate"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Tanggal Masuk</FormLabel>
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
