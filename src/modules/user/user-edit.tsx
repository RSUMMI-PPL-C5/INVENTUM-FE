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
import { format, isValid } from "date-fns";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Hide, Show } from "react-iconly";

interface Division {
	id: number;
	divisi: string;
}

interface UpdatePayload {
    fullname: string;
    email: string;
    role: string;
    divisiId: number;
    waNumber: string;
    password?: string;
  };

const formSchema = z.object({
	nokar: z.string().min(1, { message: "No. Kar wajib diisi" }),
	fullname: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
	username: z.string().min(1, { message: "Username wajib diisi" }),
	email: z
		.string()
		.email({ message: "Format email tidak valid" })
		.min(1, { message: "Email wajib diisi" }),
	password: z.string().optional(),
	divisiId: z.string().min(1, { message: "Divisi wajib diisi" }),
	role: z.string().min(1, { message: "Role wajib diisi" }),
	waNumber: z.string().min(1, { message: "No. WA wajib diisi" }),
	entryDate: z.date().optional(),
	createdOn: z.string().optional(),
});

const roles = [
	{ id: "1", name: "User" },
	{ id: "2", name: "Fasum" },
	{ id: "3", name: "Admin" },
];

export default function UserEdit() {
	const router = useRouter();
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [divisions, setDivisions] = useState<Division[]>([]);
	const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

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
			createdOn: "",
		},
	});

	useEffect(() => {

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

		async function fetchUserData() {
			try {
				setLoading(true);
				const token = Cookies.get("accessToken");
	
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: token ? `Bearer ${token}` : "",
						},
					}
				);
	
				const userData = await response.json();
	
				if (!response.ok) {
					toast.error(<>Error fetching user:<br />{userData.message}</>);
					return;
				}
	
				// Format dates for display
				const createdDate = userData.createdOn ? new Date(userData.createdOn) : null;
				const formattedCreatedDate = createdDate && isValid(createdDate)
					? format(createdDate, "yyyy-MM-dd")
					: "";
	
				// Set form values
				form.reset({
					nokar: userData.nokar || "",
					fullname: userData.fullname || "",
					username: userData.username || "",
					email: userData.email || "",
					password: "",
					divisiId: userData.divisiId ? userData.divisiId.toString() : "",
					role: userData.role || "",
					waNumber: userData.waNumber || "",
					createdOn: formattedCreatedDate,
					entryDate: createdDate || undefined,
				});
			} catch (error) {
				console.error("Error fetching user data:", error);
				toast.error(error instanceof Error ? error.message : 'Error fetching user data');
			} finally {
				setLoading(false);
			}
		}
		fetchAllDivisions();
		fetchUserData();
	}, [id, form]);


	async function updateUser(data: z.infer<typeof formSchema>) {
		setLoading(true);

		try {
			const token = Cookies.get("accessToken");

			const updatePayload : UpdatePayload = {
				fullname: data.fullname,
				email: data.email,
				role: data.role,
				divisiId: Number.parseInt(data.divisiId),
				waNumber: data.waNumber
			};

			if (isPasswordEnabled && data.password) {
				updatePayload.password = data.password;
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify(updatePayload),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				toast.error(<>Error updating user:<br />{result.message}</>);
				return;
			}

			toast.info("Pengguna berhasil diperbarui");
			router.push("/dashboard/user");
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error(error instanceof Error ? error.message : 'Error updating user');
		} finally {
			setLoading(false);
		}
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		await updateUser(values);
	}

	const handlePasswordToggle = () => {
		setIsPasswordEnabled(!isPasswordEnabled);
		if (isPasswordEnabled) {
			form.setValue("password", "");
		}
	};

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
					Ubah Pengguna
				</span>
			</div>

			{loading ? (
				<div className="flex justify-center p-8">
					<div className="animate-pulse text-center">
						Memuat Data Pengguna...
					</div>
				</div>
			) : (
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
											disabled
											placeholder="Nomor karyawan"
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
											disabled
											placeholder="Username"
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
											placeholder="Email"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						{/* Password Field with Toggle */}
						<div className="space-y-4">
                            {isPasswordEnabled && (
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password Baru</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            placeholder="Masukkan password baru"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            className="absolute right-0 top-0 h-full bg-transparent"
                                                            aria-label={
                                                                showPassword
                                                                    ? "Hide password"
                                                                    : "Show password"
                                                            }
                                                            onClick={() =>
                                                                setShowPassword((prev) => !prev)
                                                            }
                                                        >
                                                            {showPassword ? (
                                                                <Hide
                                                                    set="curved"
                                                                    stroke="bold"
                                                                    primaryColor="#203268"
                                                                    filled
                                                                />
                                                            ) : (
                                                                <Show
                                                                    set="curved"
                                                                    stroke="bold"
                                                                    primaryColor="#203268"
                                                                    filled
                                                                />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
							<div className="flex items-center gap-2">
								<Button
									type="button"
									onClick={handlePasswordToggle}
									variant={isPasswordEnabled ? "destructive" : "outline"}
								>
									{isPasswordEnabled
										? "Batalkan Ganti Password"
										: "Ganti Password"}
								</Button>
							</div>
							
						</div>
						
						<FormField
							control={form.control}
							name="divisiId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Divisi</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Pilih Divisi" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
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
										value={field.value}
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
							name="createdOn"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tanggal Akun Dibuat</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												{...field}
												disabled
												aria-label="Tanggal Akun Dibuat"
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
							<Button type="submit" disabled={loading}>
								{loading ? "Menyimpan..." : "Simpan"}
							</Button>
						</div>
					</form>
				</Form>
			)}
		</>
	);
}