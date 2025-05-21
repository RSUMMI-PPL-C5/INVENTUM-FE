"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	onConfirm: () => Promise<void> | void;
	isDeleting: boolean;
	deleteButtonText?: string;
	cancelButtonText?: string;
}

export default function DeleteDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	isDeleting,
	deleteButtonText = "Delete",
	cancelButtonText = "Cancel",
}: DeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className="w-full sm:w-auto"
					>
						{cancelButtonText}
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isDeleting}
						variant="destructive"
						className="w-full sm:w-auto"
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							deleteButtonText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
