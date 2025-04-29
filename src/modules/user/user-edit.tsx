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
import { CalendarIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { format, isValid } from "date-fns";
import { Hide, Show } from "react-iconly";
import Cookies from "js-cookie";
import { decodeToken } from "@/lib/utils";

const formSchema = z.object({
	nokar: z.string().min(1, { message: "No. Kar wajib diisi" }),
	fullname: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
	username: z.string().min(1, { message: "Username wajib diisi" }),
	password: z.string().optional(),
	divisiId: z.string().min(1, { message: "Divisi wajib diisi" }),
	role: z.string().min(1, { message: "Role wajib diisi" }),
	waNumber: z.string().min(1, { message: "No. WA wajib diisi" }),
	createdOn: z.string().optional(),
});

// Add the Division type at the top of the file, after imports
interface Division {
	id: number;
	divisi: string;
}

const roles = [
	{ id: "1", name: "User" },
	{ id: "2", name: "Fasum" },
	{ id: "3", name: "Admin" },
];

export default function UserEdit() {
	const router = useRouter();
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [divisions, setDivisions] = useState<Division[]>([]);
	const [userId, setUserId] = useState<string>("");
	const [updateError, setUpdateError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [errorModalOpen, setErrorModalOpen] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	useEffect(() => {
		fetchAllDivisions();
		fetchUserId();
	}, []);

	const fetchUserId = async () => {
		try {
			const token = Cookies.get("accessToken");

			if (!token) {
				console.error("No token found");
				setLoading(false);
				return;
			}

			const decodedToken = decodeToken(token);

			setUserId(decodedToken.userId);
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setLoading(false);
		}
	};

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

	useEffect(() => {
		async function fetchUser() {
			try {
				const token = Cookies.get("accessToken");

				const headers: Record<string, string> = {
					"Content-Type": "application/json",
				};

				if (token) {
					headers.Authorization = `Bearer ${token}`;
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
					{
						headers,
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch user data");
				}

				const userData = await response.json();

				const entryDate = new Date(userData.createdOn);
				const formattedDate = isValid(entryDate)
					? format(entryDate, "yyyy-MM-dd")
					: "Invalid date";

				form.reset({
					nokar: userData.nokar,
					fullname: userData.fullname,
					username: userData.username,
					password: "",
					divisiId: userData.divisiId.toString(),
					role: userData.role,
					waNumber: userData.waNumber,
					createdOn: formattedDate,
				});
			} catch (error) {
				console.error("Error fetching user data:", error);
				setError("Failed to fetch user data");
			} finally {
				setLoading(false);
			}
		}

		fetchUser();
	}, [id, form]);

	async function updateUser(data: z.infer<typeof formSchema>) {
		try {
			const token = Cookies.get("accessToken");

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
				{
					method: "PUT",
					headers,
					body: JSON.stringify({
						...data,
						modifiedBy: userId,
						modifiedOn: new Date(),
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update user");
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Error updating user:", error);
			throw error;
		}
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const updatedValues = values;

			// Jika password tidak diubah, hapus field password dari updatedValues
			if (!isPasswordEnabled) {
				delete updatedValues.password;
			}

			await updateUser(updatedValues);
			router.push("/dashboard/user"); // Redirect setelah simpan
		} catch (error) {
			console.error("Failed to update user:", error);
			setUpdateError("Failed to update user");
		}
	}

	const handlePasswordToggle = () => {
		setIsPasswordEnabled(!isPasswordEnabled);
		if (isPasswordEnabled) {
			form.setValue("password", "");
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<>
			<span className="text-header-h5 font-bold font-poppins">
				Ubah Pengguna
			</span>

			{updateError && <div className="text-red-500">{updateError}</div>}

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
					className="space-y-6"
				>
					<FormField
						control={form.control}
						name="nokar"
						render={({ field }) => (
							<FormItem>
								<FormLabel>No. Karyawan</FormLabel>
								<FormControl>
									<Input {...field} disabled />
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
									<Input {...field} />
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
									<Input {...field} disabled />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex items-end gap-2 mt-8">
						<Button
							type="button"
							onClick={handlePasswordToggle}
							className="h-10"
						>
							{isPasswordEnabled
								? "Batalkan Ganti Password"
								: "Ganti Password"}
						</Button>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="flex-1">
									<div className="relative">
										<Input
											placeholder="******"
											type={
												showPassword
													? "text"
													: "password"
											}
											className="pr-12"
											disabled={!isPasswordEnabled}
											{...field}
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
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

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
						name="waNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>No. WA</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
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
											aria-label="Tanggal Akun Dibuat"
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
						<Button type="submit">Simpan</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
