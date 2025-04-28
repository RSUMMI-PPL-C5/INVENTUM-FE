import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import UserFilterModal from "@/components/general/user-filter-modal";

describe("UserFilterModal", () => {
	const mockFilters = {
		role: [],
		division: "all", // Changed from empty string to "all"
		createdOnStart: null,
		createdOnEnd: null,
		modifiedOnStart: null,
		modifiedOnEnd: null,
	};

	// Mock divisions data
	const mockDivisions = [
		{ id: 1, divisi: "Divisi A" },
		{ id: 2, divisi: "Divisi B" },
		{ id: 3, divisi: "Divisi C" },
	];

	const mockOnConfirm = jest.fn();
	const mockOnCancel = jest.fn();

	const today = new Date();
	const todayDate = today.getDate();

	const yesterday = new Date(today);
	yesterday.setDate(todayDate - 1);
	const yesterdayDate = yesterday.getDate();

	const tomorrow = new Date(today);
	tomorrow.setDate(todayDate + 1);
	const tomorrowDate = tomorrow.getDate();

	function selectDate(date: number, count: number) {
		return (date >= 23 && count > 1) ? 1 : 0;
	}

	function renderModal() {
		render(
			<UserFilterModal
				isOpen={true}
				filters={mockFilters}
				divisions={mockDivisions}
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);
	}

	Element.prototype.scrollIntoView = jest.fn();
	
	beforeEach(() => {
		mockOnConfirm.mockClear();
		mockOnCancel.mockClear();
	});

	it("renders correctly", () => {
		renderModal();
		expect(screen.getByText("Filter Pengguna")).toBeInTheDocument();
		expect(screen.getByText("Role")).toBeInTheDocument();
		expect(screen.getByText("User")).toBeInTheDocument();
		expect(screen.getByText("Fasum")).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Divisi")).toBeInTheDocument();
		const divisionHeading = screen.getByText("Divisi");
		expect(divisionHeading.parentElement?.querySelector("button")).toBeInTheDocument();
		expect(screen.getByText("Tanggal Pembuatan")).toBeInTheDocument();
		expect(screen.getByText("Tanggal Modifikasi")).toBeInTheDocument();
		expect(screen.getByText("Reset")).toBeInTheDocument();
		expect(screen.getByText("Batal")).toBeInTheDocument();
		expect(screen.getByText("Terapkan")).toBeInTheDocument();
	});

	it("doesn't render if not opened", () => {
		render(
			<UserFilterModal
				isOpen={false}
				filters={mockFilters}
				divisions={mockDivisions}
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.queryByText("Filter Pengguna")).not.toBeInTheDocument();
	});

	it("allows selecting multiple roles", () => {
		renderModal();
		const userCheckbox = screen.getByLabelText("User");
		const fasumCheckbox = screen.getByLabelText("Fasum");
		const adminCheckbox = screen.getByLabelText("Admin");

		fireEvent.click(userCheckbox);
		fireEvent.click(fasumCheckbox);
		fireEvent.click(adminCheckbox);

		expect(userCheckbox).toBeChecked();
		expect(fasumCheckbox).toBeChecked();
		expect(adminCheckbox).toBeChecked();
	});

	it("allows selecting a division from dropdown", async () => {
		renderModal();
		const divisionHeading = screen.getByText("Divisi");
		const divisionSelect = divisionHeading.parentElement?.querySelector("button");
		fireEvent.click(divisionSelect!);
		
		await waitFor(() => {
			expect(screen.getByText("Divisi A")).toBeInTheDocument();
		});
		
		fireEvent.click(screen.getByText("Divisi A"));
		
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalledWith(expect.objectContaining({
			division: "1"
		}));
	});

	it("unchecks the role checkboxes if clicked twice", () => {
		renderModal();
		const userCheckbox = screen.getByLabelText("User");
		const fasumCheckbox = screen.getByLabelText("Fasum");
		const adminCheckbox = screen.getByLabelText("Admin");

		fireEvent.click(userCheckbox);
		fireEvent.click(userCheckbox);
		fireEvent.click(fasumCheckbox);
		fireEvent.click(fasumCheckbox);
		fireEvent.click(adminCheckbox);
		fireEvent.click(adminCheckbox);

		expect(userCheckbox).not.toBeChecked();
		expect(fasumCheckbox).not.toBeChecked();
		expect(adminCheckbox).not.toBeChecked();
	});

	it("allows selecting a date range", () => {
		renderModal();
		const dateInputs = screen.getAllByText("Pilih tanggal");
		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(yesterdayDate);
		let selectedDate = selectDate(todayDate, createdOnStartDate.length);
		fireEvent.click(createdOnStartDate[selectedDate]);
		
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);
		
		const createdOnEndDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, createdOnEndDate.length);
		fireEvent.click(createdOnEndDate[selectedDate]);
		
		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(yesterdayDate);
		selectedDate = selectDate(todayDate, modifiedOnStartDate.length);
		fireEvent.click(modifiedOnStartDate[selectedDate]);

		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);

		const modifiedOnEndDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, modifiedOnEndDate.length);
		fireEvent.click(modifiedOnEndDate[selectedDate]);
		
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		
		expect(lastCall.createdOnStart?.getDate()).toBe(yesterdayDate);
		expect(lastCall.createdOnEnd?.getDate()).toBe(todayDate);
		expect(lastCall.modifiedOnStart?.getDate()).toBe(yesterdayDate);
		expect(lastCall.modifiedOnEnd?.getDate()).toBe(todayDate);
	});

	it("deselects the date range if clicked twice", () => {
		renderModal();
		const dateInputs = screen.getAllByText("Pilih tanggal");
		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(yesterdayDate);
		let selectedDate = selectDate(todayDate, createdOnStartDate.length);
		fireEvent.click(createdOnStartDate[selectedDate]);
		fireEvent.click(createdOnStartDate[selectedDate]);
		
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);
		
		const createdOnEndDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, createdOnEndDate.length);
		fireEvent.click(createdOnEndDate[selectedDate]);
		fireEvent.click(createdOnEndDate[selectedDate]);
		
		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(yesterdayDate);
		selectedDate = selectDate(todayDate, modifiedOnStartDate.length);
		fireEvent.click(modifiedOnStartDate[selectedDate]);
		fireEvent.click(modifiedOnStartDate[selectedDate]);

		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);

		const modifiedOnEndDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, modifiedOnEndDate.length);
		fireEvent.click(modifiedOnEndDate[selectedDate]);
		fireEvent.click(modifiedOnEndDate[selectedDate]);
		
		fireEvent.click(screen.getByText("Terapkan"));

		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];

		expect(lastCall.createdOnStart).toBeNull();
		expect(lastCall.createdOnEnd).toBeNull();
		expect(lastCall.modifiedOnStart).toBeNull();
		expect(lastCall.modifiedOnEnd).toBeNull();
	});

	it("forbids user from picking date after today", () => {
		renderModal();
	
		const dateInputs = screen.getAllByText("Pilih tanggal");
		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);
	
		const createdOnStartDate = screen.getAllByText(tomorrowDate);
		let selectedDate = selectDate(todayDate, createdOnStartDate.length);
		fireEvent.click(createdOnStartDate[selectedDate]);
	
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);
	
		const createdOnEndDate = screen.getAllByText(tomorrowDate);
		selectedDate = selectDate(todayDate, createdOnEndDate.length);
		fireEvent.click(createdOnEndDate[selectedDate]);
	
		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);
	
		const modifiedOnStartDate = screen.getAllByText(tomorrowDate);
		selectedDate = selectDate(todayDate, modifiedOnStartDate.length);
		fireEvent.click(modifiedOnStartDate[selectedDate]);
	
		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);
	
		const modifiedOnEndDate = screen.getAllByText(tomorrowDate);
		selectedDate = selectDate(todayDate, modifiedOnEndDate.length);
		fireEvent.click(modifiedOnEndDate[selectedDate]);
	
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		
		expect(lastCall.createdOnStart).toBeNull();
		expect(lastCall.createdOnEnd).toBeNull();
		expect(lastCall.modifiedOnStart).toBeNull();
		expect(lastCall.modifiedOnEnd).toBeNull();
	});
	
	it("forbids user from picking end date that's before the selected start date", () => {
		renderModal();
		const dateInputs = screen.getAllByText("Pilih tanggal");
		
		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(todayDate);
		let selectedDate = selectDate(todayDate, createdOnStartDate.length);
		fireEvent.click(createdOnStartDate[selectedDate]);
	
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(yesterdayDate);
		selectedDate = selectDate(todayDate, createdOnEndDate.length);
		fireEvent.click(createdOnEndDate[selectedDate]);

		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);
	
		const modifiedOnStartDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, modifiedOnStartDate.length);
		fireEvent.click(modifiedOnStartDate[selectedDate]);
	
		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);
	
		const modifiedOnEndDate = screen.getAllByText(yesterdayDate);
		selectedDate = selectDate(todayDate, modifiedOnEndDate.length);
		fireEvent.click(modifiedOnEndDate[selectedDate]);
	
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		
		const expectedDay = todayDate;
		expect(lastCall.createdOnStart?.getDate()).toBe(expectedDay);
		expect(lastCall.createdOnEnd).toBeNull();
		expect(lastCall.modifiedOnStart?.getDate()).toBe(expectedDay);
		expect(lastCall.modifiedOnEnd).toBeNull();
	});

	it("changes end date to start date if the user change the start date to a date after end date", () => {
		renderModal();
		const dateInputs = screen.getAllByText("Pilih tanggal");
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(yesterdayDate);
		let selectedDate = selectDate(todayDate, createdOnEndDate.length);
		fireEvent.click(createdOnEndDate[selectedDate]);

		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, createdOnStartDate.length);
		fireEvent.click(createdOnStartDate[selectedDate]);

		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);

		const ModifiedOnEndDate = screen.getAllByText(yesterdayDate);
		selectedDate = selectDate(todayDate, ModifiedOnEndDate.length);
		fireEvent.click(ModifiedOnEndDate[selectedDate]);

		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(todayDate);
		selectedDate = selectDate(todayDate, modifiedOnStartDate.length);
		fireEvent.click(modifiedOnStartDate[selectedDate]);

		fireEvent.click(screen.getByText("Terapkan"));

		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		expect(lastCall.createdOnStart?.getDate()).toBe(todayDate);
		expect(lastCall.createdOnEnd?.getDate()).toBe(todayDate);
		expect(lastCall.modifiedOnStart?.getDate()).toBe(todayDate);
		expect(lastCall.modifiedOnEnd?.getDate()).toBe(todayDate);
	});

	it("resets filter when reset button is clicked", () => {
		renderModal();

		fireEvent.click(screen.getByText("Reset"));
		fireEvent.click(screen.getByText("Terapkan"));
		expect(mockOnConfirm).toHaveBeenCalledWith({
			role: [],
			division: "all",
			createdOnStart: null,
			createdOnEnd: null,
			modifiedOnStart: null,
			modifiedOnEnd: null,
		});
	});

	it("hides modal when Escape key is pressed", () => {
		renderModal();
	
		fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
	
		expect(mockOnCancel).toHaveBeenCalled();
	});

	it("hides modal when cancel button is clicked", () => {
		renderModal();
		fireEvent.click(screen.getByText("Batal"));

		expect(mockOnCancel).toHaveBeenCalled();
	});

	it("updates filter state when confirm button is clicked", () => {
		renderModal();
		fireEvent.click(screen.getByText("Terapkan"));
	});

	it("allows selecting 'All Divisions' option", async () => {
		renderModal();
		
		const divisionHeading = screen.getByText("Divisi");
		const divisionSelect = divisionHeading.parentElement?.querySelector("button");
		fireEvent.click(divisionSelect!);
		
		await waitFor(() => {
			const allDivisionsOptions = screen.getAllByText("Semua Divisi");
			fireEvent.click(allDivisionsOptions[0]);
		});
		
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalledWith(expect.objectContaining({
			division: "all"
		}));
	});
});
