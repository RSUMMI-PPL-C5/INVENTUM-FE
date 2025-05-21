import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type HistoryDetailProps = {
	isOpen: boolean;
	onClose: () => void;
	data: HistoryData;
	type: "maintenance" | "calibration" | "sparepart";
};

type HistoryData = {
	actionPerformed: string | null;
	technician: string | null;
	result: string | null;
	maintenanceDate?: string | null;
	calibrationMethod?: string | null;
	calibrationDate?: string | null;
	nextCalibrationDue?: string | null;
	sparepartName?: string | null;
	sparepartId?: string | null;
	replacementDate?: string | null;
	createdBy: string | null;
	createdOn: string | null;
};

export default function HistoryDetailModal({
	isOpen,
	onClose,
	data,
	type,
}: HistoryDetailProps) {
	if (!data) return null;

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}).format(date);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md w-[90vw] max-w-[90vw] sm:w-full">
				<DialogHeader>
					<DialogTitle>
						{type === "maintenance"
							? "Detail Riwayat Maintenance"
							: type === "calibration"
							? "Detail Riwayat Kalibrasi"
							: "Detail Riwayat Ganti Suku Cadang"}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<DetailItem
							label="Deskripsi"
							value={data.actionPerformed}
						/>
						<DetailItem label="Teknisi" value={data.technician} />
						<DetailItem label="Hasil" value={data.result} />

						{type === "maintenance" && (
							<DetailItem
								label="Tanggal Maintenance"
								value={formatDate(data.maintenanceDate!)}
							/>
						)}

						{type === "calibration" && (
							<>
								<DetailItem
									label="Metode Kalibrasi"
									value={data.calibrationMethod!}
								/>
								<DetailItem
									label="Tanggal Kalibrasi"
									value={formatDate(data.calibrationDate!)}
								/>
								<DetailItem
									label="Kalibrasi Berikutnya"
									value={
										data.nextCalibrationDue
											? formatDate(
													data.nextCalibrationDue
											  )
											: "-"
									}
								/>
							</>
						)}

						{type === "sparepart" && (
							<>
								<DetailItem
									label="Nama Suku Cadang"
									value={data.sparepartName!}
								/>
								<DetailItem
									label="ID Suku Cadang"
									value={data.sparepartId!}
								/>
								<DetailItem
									label="Tanggal Penggantian"
									value={formatDate(data.replacementDate!)}
								/>
							</>
						)}

						<DetailItem
							label="Dibuat Oleh"
							value={data.createdBy}
						/>
						<DetailItem
							label="Dibuat Pada"
							value={formatDate(data.createdOn)}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
	return (
		<div className="space-y-1 w-full break-words">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<p className="text-sm break-all">{value || "-"}</p>
		</div>
	);
}
