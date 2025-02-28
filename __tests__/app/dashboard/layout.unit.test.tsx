import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/dashboard/layout";

// Mock the SideBar and Breadcrumb components (default mocks)
jest.mock("@/components/general/sidebar", () => {
	return jest.fn(() => <div data-testid="sidebar">SideBar</div>);
});

jest.mock("@/components/general/breadcrumb", () => {
	return jest.fn(() => <div data-testid="breadcrumb">Breadcrumb</div>);
});

describe("DashboardLayout Component", () => {
    
	// Positive Cases
	it("renders the SideBar, Breadcrumb, and children correctly", () => {
		render(
			<DashboardLayout>
				<div data-testid="child">Test Child</div>
			</DashboardLayout>
		);

		const sidebar = screen.getByTestId("sidebar");
		expect(sidebar).toBeInTheDocument();

		const breadcrumb = screen.getByTestId("breadcrumb");
		expect(breadcrumb).toBeInTheDocument();

		const child = screen.getByTestId("child");
		expect(child).toBeInTheDocument();

		const mainContainer = screen.getByTestId("main");
		expect(mainContainer).toHaveClass("flex");
	});

	it("renders the correct HTML structure", () => {
		render(
			<DashboardLayout>
				<div data-testid="child">Test Child</div>
			</DashboardLayout>
		);

		const htmlElement = document.documentElement;
		expect(htmlElement).toHaveAttribute("lang", "en");

		const bodyElement = document.body;
		expect(bodyElement).toBeInTheDocument();
	});

	// Negative Cases
	it("renders without children", () => {
		render(<DashboardLayout children={undefined} />);
		const child = screen.queryByTestId("child");
		expect(child).not.toBeInTheDocument();
	});
});