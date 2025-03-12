import { render, screen, fireEvent } from "@testing-library/react";
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

	function formatDate(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

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

	it("renders header and filter options texts correctly", () => {
		renderModal();
		expect(screen.getByText("Filter")).toBeInTheDocument();
		expect(screen.getByText("Role")).toBeInTheDocument();
		expect(screen.getByText("User")).toBeInTheDocument();
		expect(screen.getByText("Asesor")).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Divisi")).toBeInTheDocument();
		expect(screen.getByText("Divisi A")).toBeInTheDocument();
		expect(screen.getByText("Divisi B")).toBeInTheDocument();
		expect(screen.getByText("Divisi C")).toBeInTheDocument();
		expect(screen.getByText("Tanggal dibuat")).toBeInTheDocument();
		expect(screen.getByText("Terakhir diubah")).toBeInTheDocument();
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
		expect(screen.getByText("OK")).toBeInTheDocument();
	});

	it("allows selecting multiple roles", () => {
		renderModal();
		const userCheckbox = screen.getByLabelText("User");
		const adminCheckbox = screen.getByLabelText("Admin");

		fireEvent.click(userCheckbox);
		fireEvent.click(adminCheckbox);

		expect(userCheckbox).toBeChecked();
		expect(adminCheckbox).toBeChecked();
	});

	it("allows selecting multiple divisions", () => {
		renderModal();
		const divA = screen.getByLabelText("Divisi A");
		const divB = screen.getByLabelText("Divisi B");

		fireEvent.click(divA);
		fireEvent.click(divB);

		expect(divA).toBeChecked();
		expect(divB).toBeChecked();
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

	it("should set date as null if date picker is cleared", () => {
		renderModal();
		const createdOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(
			yesterday.getDate().toString()
		)[0];
		fireEvent.click(createdOnStartDate);

		const clearButton = createdOnStart.parentElement?.querySelector(
			'button[aria-label="Close"]'
		);
		expect(clearButton).toBeInTheDocument();

		if (clearButton) fireEvent.click(clearButton);
		expect(createdOnStart).toHaveValue("");
	});

	it("allows selecting a date range", () => {
		renderModal();
		const createdOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(
			yesterday.getDate().toString()
		)[0];
		fireEvent.click(createdOnStartDate);

		const createdOnEnd = screen.getAllByPlaceholderText("Tanggal Akhir")[0];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(
			today.getDate().toString()
		)[0];
		fireEvent.click(createdOnEndDate);

		expect(createdOnStart).toHaveValue(formatDate(yesterday));
		expect(createdOnEnd).toHaveValue(formatDate(today));

		const modifiedOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[1];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(
			yesterday.getDate().toString()
		)[0];
		fireEvent.click(modifiedOnStartDate);

		const modifiedOnEnd =
			screen.getAllByPlaceholderText("Tanggal Akhir")[1];
		fireEvent.click(modifiedOnEnd);

		const modifiedOnEndDate = screen.getAllByText(
			today.getDate().toString()
		)[0];
		fireEvent.click(modifiedOnEndDate);

		expect(modifiedOnStart).toHaveValue(formatDate(yesterday));
		expect(modifiedOnEnd).toHaveValue(formatDate(today));
	});

	it("forbids user from picking date after today", () => {
		renderModal();
		const createdOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(
			tomorrow.getDate().toString()
		)[0];
		fireEvent.click(createdOnStartDate);

		const createdOnEnd = screen.getAllByPlaceholderText("Tanggal Akhir")[0];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(
			tomorrow.getDate().toString()
		)[0];
		fireEvent.click(createdOnEndDate);

		expect(createdOnStart).toHaveValue("");
		expect(createdOnEnd).toHaveValue("");

		const modifiedOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[1];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(
			tomorrow.getDate().toString()
		)[0];
		fireEvent.click(modifiedOnStartDate);

		const modifiedOnEnd =
			screen.getAllByPlaceholderText("Tanggal Akhir")[1];
		fireEvent.click(modifiedOnEnd);

		const modifiedOnEndDate = screen.getAllByText(
			tomorrow.getDate().toString()
		)[0];
		fireEvent.click(modifiedOnEndDate);
		expect(modifiedOnStart).toHaveValue("");
		expect(modifiedOnEnd).toHaveValue("");
	});

	it("forbids user from picking end date before today", () => {
		renderModal();
		const createdOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(
			today.getDate().toString()
		)[0];
		fireEvent.click(createdOnStartDate);

		const createdOnEnd = screen.getAllByPlaceholderText("Tanggal Akhir")[0];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(
			yesterday.getDate().toString()
		)[0];
		fireEvent.click(createdOnEndDate);

		expect(createdOnStart).toHaveValue(formatDate(today));
		expect(createdOnEnd).toHaveValue("");
	});

	it("changes end date to start date if the user change the start date to a date after end date", () => {
		renderModal();
		const createdOnEnd = screen.getAllByPlaceholderText("Tanggal Akhir")[0];
		fireEvent.click(createdOnEnd);

		const createdOnEndDate = screen.getAllByText(
			yesterday.getDate().toString()
		)[0];
		fireEvent.click(createdOnEndDate);

		const createdOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[0];
		fireEvent.click(createdOnStart);

		const createdOnStartDate = screen.getAllByText(
			today.getDate().toString()
		)[0];
		fireEvent.click(createdOnStartDate);

		expect(createdOnStart).toHaveValue(formatDate(today));
		expect(createdOnEnd).toHaveValue(formatDate(today));

		const modifiedOnEnd =
			screen.getAllByPlaceholderText("Tanggal Akhir")[1];
		fireEvent.click(modifiedOnEnd);

		const ModifiedOnEndDate = screen.getAllByText(
			yesterday.getDate().toString()
		)[0];
		fireEvent.click(ModifiedOnEndDate);

		const modifiedOnStart =
			screen.getAllByPlaceholderText("Tanggal Mulai")[1];
		fireEvent.click(modifiedOnStart);

		const modifiedOnStartDate = screen.getAllByText(
			today.getDate().toString()
		)[0];
		fireEvent.click(modifiedOnStartDate);

		expect(modifiedOnStart).toHaveValue(formatDate(today));
		expect(modifiedOnEnd).toHaveValue(formatDate(today));
	});

	it("hides modal when cancel button is clicked", () => {
		renderModal();
		fireEvent.click(screen.getByText("Batal"));

		expect(mockOnCancel).toHaveBeenCalled();
	});

	it("updates filter state when confirm button is clicked", () => {
		renderModal();
		fireEvent.click(screen.getByText("OK"));

		expect(mockOnConfirm).toHaveBeenCalled();
	});
});
