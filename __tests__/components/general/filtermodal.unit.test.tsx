import { render, screen, fireEvent } from "@testing-library/react";
import { format } from "date-fns";
import React from "react";
import UserFilterModal from "@/components/general/filter-modal";

describe("UserFilterModal", () => {
	const mockFilters = {
		role: [],
		division: [],
		createdOnStart: null,
		createdOnEnd: null,
		modifiedOnStart: null,
		modifiedOnEnd: null,
	};

	const mockOnConfirm = jest.fn();
	const mockOnCancel = jest.fn();

	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);

	function renderModal() {
		render(
			<UserFilterModal
				isOpen={true}
				filters={mockFilters}
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);
	}
	
	// Add beforeEach to clear mocks before each test
	beforeEach(() => {
		mockOnConfirm.mockClear();
		mockOnCancel.mockClear();
	});

	it("renders header and filter options texts correctly", () => {
		renderModal();
		expect(screen.getByText("Filter Pengguna")).toBeInTheDocument();
		expect(screen.getByText("Role")).toBeInTheDocument();
		expect(screen.getByText("User")).toBeInTheDocument();
		expect(screen.getByText("Manager")).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Divisi")).toBeInTheDocument();
		expect(screen.getByText("Divisi A")).toBeInTheDocument();
		expect(screen.getByText("Divisi B")).toBeInTheDocument();
		expect(screen.getByText("Divisi C")).toBeInTheDocument();
		expect(screen.getByText("Tanggal Pembuatan")).toBeInTheDocument();
		expect(screen.getByText("Tanggal Modifikasi")).toBeInTheDocument();
	});

	it("doesn't render if not opened", () => {
		render(
			<UserFilterModal
				isOpen={false}
				filters={mockFilters}
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.queryByText("Filter")).not.toBeInTheDocument();
	});

	it("renders cancel and confirm buttons", () => {
		renderModal();
		expect(screen.getByText("Batal")).toBeInTheDocument();
		expect(screen.getByText("Terapkan")).toBeInTheDocument();
	});

	it("allows selecting multiple roles", () => {
		renderModal();
		const userCheckbox = screen.getByLabelText("User");
		const adminCheckbox = screen.getByLabelText("Admin");
		const managerCheckbox = screen.getByLabelText("Manager");

		fireEvent.click(userCheckbox);
		fireEvent.click(adminCheckbox);
		fireEvent.click(managerCheckbox);

		expect(userCheckbox).toBeChecked();
		expect(adminCheckbox).toBeChecked();
		expect(managerCheckbox).toBeChecked();
	});

	it("allows selecting multiple divisions", () => {
		renderModal();
		const divA = screen.getByLabelText("Divisi A");
		const divB = screen.getByLabelText("Divisi B");
		const divC = screen.getByLabelText("Divisi C");

		fireEvent.click(divA);
		fireEvent.click(divB);
		fireEvent.click(divC);

		expect(divA).toBeChecked();
		expect(divB).toBeChecked();
		expect(divC).toBeChecked();
	});

	it("unchecks the checkboxes if clicked twice", () => {
		renderModal();
		const userCheckbox = screen.getByLabelText("User");
		const adminCheckbox = screen.getByLabelText("Admin");

		fireEvent.click(userCheckbox);
		fireEvent.click(adminCheckbox);
		fireEvent.click(userCheckbox);
		fireEvent.click(adminCheckbox);

		expect(userCheckbox).not.toBeChecked();
		expect(adminCheckbox).not.toBeChecked();
	});

	it("allows selecting a date range", () => {
		renderModal();
		const dateInputs = screen.getAllByText("Pilih tanggal");
		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(yesterday.getDate().toString())[0];
		fireEvent.click(createdOnStartDate);
		
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);
		
		const createdOnEndDate = screen.getAllByText(today.getDate().toString())[0];
		fireEvent.click(createdOnEndDate);
		
		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(yesterday.getDate().toString())[0];
		fireEvent.click(modifiedOnStartDate);

		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);

		const modifiedOnEndDate = screen.getAllByText(today.getDate().toString())[0];
		fireEvent.click(modifiedOnEndDate);
		
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		
		expect(lastCall.createdOnStart?.getDate()).toBe(yesterday.getDate());
		expect(lastCall.createdOnEnd?.getDate()).toBe(today.getDate());
		expect(lastCall.modifiedOnStart?.getDate()).toBe(yesterday.getDate());
		expect(lastCall.modifiedOnEnd?.getDate()).toBe(today.getDate());
	});

	it("forbids user from picking date after today", () => {
		renderModal();
	
		const dateInputs = screen.getAllByText("Pilih tanggal");
		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);
	
		const createdOnStartDate = screen.getAllByText(tomorrow.getDate().toString())[0];
		fireEvent.click(createdOnStartDate);
	
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);
	
		const createdOnEndDate = screen.getAllByText(tomorrow.getDate().toString())[0];
		fireEvent.click(createdOnEndDate);
	
		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);
	
		const modifiedOnStartDate = screen.getAllByText(tomorrow.getDate().toString())[0];
		fireEvent.click(modifiedOnStartDate);
	
		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);
	
		const modifiedOnEndDate = screen.getAllByText(tomorrow.getDate().toString())[0];
		fireEvent.click(modifiedOnEndDate);
	
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

		const createdOnStartDate = screen.getAllByText(today.getDate().toString())[0];
		fireEvent.click(createdOnStartDate);
	
		const createdOnEnd = dateInputs[1];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(yesterday.getDate().toString())[0];
		fireEvent.click(createdOnEndDate);

		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);
	
		const modifiedOnStartDate = screen.getAllByText(today.getDate().toString())[0];
		fireEvent.click(modifiedOnStartDate);
	
		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);
	
		const modifiedOnEndDate = screen.getAllByText(yesterday.getDate().toString())[0];
		fireEvent.click(modifiedOnEndDate);
	
		fireEvent.click(screen.getByText("Terapkan"));
		
		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		
		const expectedDay = today.getDate();
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

		const createdOnEndDate = screen.getAllByText(yesterday.getDate().toString())[0];
		fireEvent.click(createdOnEndDate);

		const createdOnStart = dateInputs[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(today.getDate().toString())[0];
		fireEvent.click(createdOnStartDate);

		const modifiedOnEnd = dateInputs[3];
		fireEvent.click(modifiedOnEnd);

		const ModifiedOnEndDate = screen.getAllByText(yesterday.getDate().toString())[0];
		fireEvent.click(ModifiedOnEndDate);

		const modifiedOnStart = dateInputs[2];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(today.getDate().toString())[0];
		fireEvent.click(modifiedOnStartDate);

		fireEvent.click(screen.getByText("Terapkan"));

		expect(mockOnConfirm).toHaveBeenCalled();
		const lastCall = mockOnConfirm.mock.calls[mockOnConfirm.mock.calls.length - 1][0];
		expect(lastCall.createdOnStart?.getDate()).toBe(today.getDate());
		expect(lastCall.createdOnEnd?.getDate()).toBe(today.getDate());
		expect(lastCall.modifiedOnStart?.getDate()).toBe(today.getDate());
		expect(lastCall.modifiedOnEnd?.getDate()).toBe(today.getDate());
	});

	it("hides modal when cancel button is clicked", () => {
		renderModal();
		fireEvent.click(screen.getByText("Batal"));

		expect(mockOnCancel).toHaveBeenCalled();
	});

	it("updates filter state when confirm button is clicked", () => {
		renderModal();
		fireEvent.click(screen.getByText("Terapkan"));

		expect(mockOnConfirm).toHaveBeenCalled();
	});
});
