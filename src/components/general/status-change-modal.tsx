import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface StatusChangeModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly currentStatus: string;
    readonly onConfirm: (status: string) => Promise<void>;
    readonly isUpdating: boolean;
    readonly title?: string;
    readonly getStatusText?: (status: string) => string;
}

// Status options with lowercase values to match API
const statusOptions = [
    { value: "pending", label: "pending" },
    { value: "on progress", label: "on progress" },
    { value: "completed", label: "completed" },
];

export default function StatusChangeModal({
    open,
    onOpenChange,
    currentStatus,
    onConfirm,
    isUpdating,
    title = "Ubah Status Permintaan",
    getStatusText = (status) => status,
}: StatusChangeModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(
        currentStatus.toLowerCase() // Ensure lowercase for matching
    );

    const handleConfirm = async () => {
        await onConfirm(selectedStatus);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                        disabled={isUpdating}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status">
                                {getStatusText(selectedStatus)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((status) => (
                                <SelectItem
                                    key={status.value}
                                    value={status.value}
                                >
                                    {getStatusText(status.value)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isUpdating}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            isUpdating ||
                            selectedStatus === currentStatus.toLowerCase()
                        }
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}