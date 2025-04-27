"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
	ChevronRight,
	ChevronDown,
	Loader2,
	Trash2,
	Plus,
	Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Division {
	id: number;
	divisi: string;
	parentId: number | null;
	children: Division[];
}

export default function DisplayDivisi() {
	const router = useRouter();
	const { toast } = useToast();
	const [divisions, setDivisions] = useState<Division[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [expandedDivisions, setExpandedDivisions] = useState<
		Record<number, boolean>
	>({});
	const [loadingChildren, setLoadingChildren] = useState<
		Record<number, boolean>
	>({});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	useEffect(() => {
		// Initial fetch - only parent divisions
		fetchParentDivisions();
	}, []);

	async function fetchParentDivisions() {
		try {
			setLoading(true);
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
				}/divisi`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch divisions");
			}

			const data = await response.json();
			setDivisions(data);
		} catch (err) {
			console.error("Error fetching parent divisions:", err);
			setError("Failed to load divisions. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	async function fetchDivisionChildren(divisionId: number) {
		// If we already have children loaded, don't fetch again
		const division = divisions.find((div) => div.id === divisionId);
		if (division && division.children && division.children.length > 0) {
			return;
		}

		try {
			setLoadingChildren((prev) => ({ ...prev, [divisionId]: true }));
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
				}/divisi/${divisionId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch children for division ${divisionId}`
				);
			}

			const childrenData = await response.json();

			// Update the divisions state with the fetched children
			setDivisions((prevDivisions) =>
				prevDivisions.map((div) =>
					div.id === divisionId
						? { ...div, children: childrenData.children || [] }
						: div
				)
			);
		} catch (err) {
			console.error("Error fetching division children:", err);
			setError(`Failed to load children for division ${divisionId}.`);
		} finally {
			setLoadingChildren((prev) => ({ ...prev, [divisionId]: false }));
		}
	}

	const handleToggleExpand = async (divisionId: number) => {
		// If expanding and we don't have children loaded yet, fetch them
		if (!expandedDivisions[divisionId]) {
			await fetchDivisionChildren(divisionId);
		}

		setExpandedDivisions((prev) => ({
			...prev,
			[divisionId]: !prev[divisionId],
		}));
	};

	const handleEditDivision = (division: Division, e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/dashboard/division/${division.id}/edit`);
	};

	function removeDivisionRecursively(
		divisions: Division[],
		divisionId: number
	): Division[] {
		return divisions
			.filter((division) => division.id !== divisionId)
			.map((division) => ({
				...division,
				children: removeDivisionRecursively(
					division.children,
					divisionId
				),
			}));
	}

	const handleDeleteClick = (division: Division, e: React.MouseEvent) => {
		e.stopPropagation();
		setDivisionToDelete(division);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!divisionToDelete) return;

		try {
			setIsDeleting(true);
			const token = Cookies.get("accessToken");

			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
				}/divisi/${divisionToDelete.id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to delete division`);
			}

			// Perbarui state divisions secara rekursif
			setDivisions((prevDivisions) =>
				removeDivisionRecursively(prevDivisions, divisionToDelete.id)
			);

			toast({
				title: "Success",
				description: "Division deleted successfully",
			});
		} catch (err) {
			console.error("Error deleting division:", err);
			toast({
				title: "Error",
				description:
					"Failed to delete division. It might have child divisions.",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDivisionToDelete(null);
		}
	};

	const renderDivisionTree = (divisions: Division[]) => {
		if (!divisions || divisions.length === 0) {
			return (
				<div className="text-sm text-gray-500 p-2">
					No divisions found
				</div>
			);
		}

		return (
			<div className="space-y-2">
				{divisions.map((division) => (
					<div key={division.id} className="ml-2">
						<div className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer justify-between">
							<div className="flex items-center">
								<Button
									variant="ghost"
									size="sm"
									className="p-0 h-6 w-6"
									onClick={(e) => {
										e.stopPropagation();
										handleToggleExpand(division.id);
									}}
								>
									{loadingChildren[division.id] ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : expandedDivisions[division.id] ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
								<span className="ml-2">{division.divisi}</span>
							</div>

							<div className="flex space-x-2">
								<Button
									size="icon"
									variant="outline"
									onClick={(e) =>
										handleEditDivision(division, e)
									}
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									variant="destructive"
									onClick={(e) =>
										handleDeleteClick(division, e)
									}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{expandedDivisions[division.id] && (
							<div className="ml-4 border-l border-gray-200 pl-2 mt-1">
								{loadingChildren[division.id] ? (
									<div className="p-2">
										<Skeleton className="h-6 w-full" />
										<Skeleton className="h-6 w-full mt-2" />
									</div>
								) : division.children &&
								  division.children.length > 0 ? (
									renderDivisionTree(division.children)
								) : (
									<div className="text-sm text-gray-500 p-2">
										No subdepartments
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		);
	};

	return (
		<>
			<div className="flex justify-between items-center mb-6">
				<span className="text-header-h5 font-bold font-poppins">
					Struktur Divisi
				</span>
				<Button onClick={() => router.push("/dashboard/division/add")}>
					<Plus className="mr-2 h-4 w-4" />
					Tambah Divisi
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Daftar Divisi</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : error ? (
						<div className="text-red-500 p-4 text-center">
							{error}
						</div>
					) : (
						renderDivisionTree(divisions)
					)}
				</CardContent>
			</Card>

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the division &quot;
							{divisionToDelete?.divisi}&quot;?
							{divisionToDelete?.children?.length ? (
								<span className="text-red-500 block mt-2">
									Warning: This division has sub-divisions
									that will also be deleted.
								</span>
							) : null}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
