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
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

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
});

const roles = [
	{ id: "1", name: "User" },
	{ id: "2", name: "Fasum" },
	{ id: "3", name: "Admin" },
];

export default function UserCreate() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [divisions, setDivisions] = useState<Division[]>([]);

	useEffect(() => {
		fetchAllDivisions();
	}, []);

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

            const result = await response.json();

            if (!response.ok) {
                toast.error(<>Error fetching divisions:<br />{result.message}</>);                
                return;
            }

			setDivisions(result);
		} catch (error) {
			console.error("Error fetching divisions:", error);
            toast.error(error instanceof Error ? error.message : 'Error fetching divisions');
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

        const result = await response.json();

        if (!response.ok) {
            toast.error(<>Error creating user :<br />{result.message}</>);
            return
        }

        toast.info("Pengguna berhasil dibuat")
        router.push("/dashboard/user");
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true);

		try {
			await createUser(values);
		} catch (error) {
			console.error("Error creating user:", error);
            toast.error(error instanceof Error ? <>Error creating user:<br />{error.message}</> : 'Error creating user');
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
