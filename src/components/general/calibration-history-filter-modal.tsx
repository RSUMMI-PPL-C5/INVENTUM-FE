"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CalibrationHistoryFilters = {
	search: string;
	result: string;
	calibrationMethod: string;
	calibrationDateStart: Date | null;
	calibrationDateEnd: Date | null;
	nextCalibrationDueBefore: Date | null;
	createdOnStart: Date | null;
	createdOnEnd: Date | null;
};

interface CalibrationHistoryFilterModalProps {
	isOpen: boolean;
	filters: CalibrationHistoryFilters;
	onConfirm: (filters: CalibrationHistoryFilters) => void;
	onCancel: () => void;
}

export default function CalibrationHistoryFilterModal({
	isOpen,
	filters,
	onConfirm,
	onCancel,
}: CalibrationHistoryFilterModalProps) {
	const [localFilters, setLocalFilters] =
		useState<CalibrationHistoryFilters>(filters);

	useEffect(() => {
		setLocalFilters(filters);
	}, [filters]);

	const handleChange = (
		field: keyof CalibrationHistoryFilters,
		value: string | Date | null
	) => {
		setLocalFilters((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleConfirm = () => {
		onConfirm(localFilters);
	};

	const handleReset = () => {
		setLocalFilters({
			search: "",
			result: "",
			calibrationMethod: "",
			calibrationDateStart: null,
			calibrationDateEnd: null,
			nextCalibrationDueBefore: null,
			createdOnStart: null,
			createdOnEnd: null,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onCancel}>
			<DialogContent className="max-w-[90vw] sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Filter Riwayat Kalibrasi</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
						<Label
							htmlFor="result"
							className="text-left sm:text-right"
						>
							Hasil
						</Label>
						<Select
							value={localFilters.result}
							onValueChange={(value) =>
								handleChange("result", value)
							}
						>
							<SelectTrigger
								className="col-span-1 sm:col-span-3"
								id="result"
							>
								<SelectValue placeholder="Pilih hasil" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Success">
									Berhasil
								</SelectItem>
								<SelectItem value="Partial">
									Sebagian
								</SelectItem>
								<SelectItem value="Failed">Gagal</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
						<Label className="text-left sm:text-right">
							Tanggal Kalibrasi
						</Label>
						<div className="col-span-1 sm:col-span-3 flex flex-col sm:flex-row gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!localFilters.calibrationDateStart &&
												"text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{localFilters.calibrationDateStart &&
										isValid(
											localFilters.calibrationDateStart
										) ? (
											format(
												localFilters.calibrationDateStart,
												"dd MMM yyyy",
												{ locale: id }
											)
										) : (
											<span>Dari tanggal</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={
											localFilters.calibrationDateStart ||
											undefined
										}
										onSelect={(date) =>
											handleChange(
												"calibrationDateStart",
												date as Date
											)
										}
										initialFocus
										locale={id}
										weekStartsOn={1}
										className="rounded-md border"
									/>
								</PopoverContent>
							</Popover>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!localFilters.calibrationDateEnd &&
												"text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{localFilters.calibrationDateEnd &&
										isValid(
											localFilters.calibrationDateEnd
										) ? (
											format(
												localFilters.calibrationDateEnd,
												"dd MMM yyyy",
												{ locale: id }
											)
										) : (
											<span>Sampai tanggal</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={
											localFilters.calibrationDateEnd ||
											undefined
										}
										onSelect={(date) =>
											handleChange(
												"calibrationDateEnd",
												date as Date
											)
										}
										initialFocus
										locale={id}
										weekStartsOn={1}
										className="rounded-md border"
										disabled={(date) =>
											localFilters.calibrationDateStart
												? date <
												  localFilters.calibrationDateStart
												: false
										}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
						<Label className="text-left sm:text-right">
							Kalibrasi Berikutnya
						</Label>
						<div className="col-span-1 sm:col-span-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!localFilters.nextCalibrationDueBefore &&
												"text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{localFilters.nextCalibrationDueBefore &&
										isValid(
											localFilters.nextCalibrationDueBefore
										) ? (
											format(
												localFilters.nextCalibrationDueBefore,
												"dd MMM yyyy",
												{ locale: id }
											)
										) : (
											<span>Sebelum tanggal</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={
											localFilters.nextCalibrationDueBefore ||
											undefined
										}
										onSelect={(date) =>
											handleChange(
												"nextCalibrationDueBefore",
												date as Date
											)
										}
										initialFocus
										locale={id}
										weekStartsOn={1}
										className="rounded-md border"
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
						<Label className="text-left sm:text-right">
							Tanggal Dibuat
						</Label>
						<div className="col-span-1 sm:col-span-3 flex flex-col sm:flex-row gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!localFilters.createdOnStart &&
												"text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{localFilters.createdOnStart &&
										isValid(localFilters.createdOnStart) ? (
											format(
												localFilters.createdOnStart,
												"dd MMM yyyy",
												{ locale: id }
											)
										) : (
											<span>Dari tanggal</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={
											localFilters.createdOnStart ||
											undefined
										}
										onSelect={(date) =>
											handleChange(
												"createdOnStart",
												date as Date
											)
										}
										initialFocus
										locale={id}
										weekStartsOn={1}
										className="rounded-md border"
									/>
								</PopoverContent>
							</Popover>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!localFilters.createdOnEnd &&
												"text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{localFilters.createdOnEnd &&
										isValid(localFilters.createdOnEnd) ? (
											format(
												localFilters.createdOnEnd,
												"dd MMM yyyy",
												{ locale: id }
											)
										) : (
											<span>Sampai tanggal</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0"
									align="start"
								>
									<Calendar
										mode="single"
										selected={
											localFilters.createdOnEnd ||
											undefined
										}
										onSelect={(date) =>
											handleChange(
												"createdOnEnd",
												date as Date
											)
										}
										initialFocus
										locale={id}
										weekStartsOn={1}
										className="rounded-md border"
										disabled={(date) =>
											localFilters.createdOnStart
												? date <
												  localFilters.createdOnStart
												: false
										}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>
				<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
					<Button
						variant="outline"
						onClick={handleReset}
						className="w-full sm:w-auto"
					>
						Reset
					</Button>
					<Button
						variant="destructive"
						onClick={onCancel}
						className="w-full sm:w-auto"
					>
						Batal
					</Button>
					<Button
						onClick={handleConfirm}
						className="w-full sm:w-auto"
					>
						Terapkan
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
