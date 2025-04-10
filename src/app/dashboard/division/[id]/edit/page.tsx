"use client";

import EditDivisi from "@/modules/division/divisi-edit";
import { useParams } from "next/navigation";

export default function EditDivisiPage() {
	// Use the useParams hook instead
	const params = useParams();
	const id = parseInt(params.id as string);
	return <EditDivisi id={id} />;
}
