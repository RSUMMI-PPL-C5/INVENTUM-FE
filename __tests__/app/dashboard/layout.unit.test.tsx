import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/dashboard/layout";

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
		expect(mainContainer).toHaveClass(
			"flex flex-col gap-8 w-full h-full p-8 z-10 shadow bg-white rounded-lg shadow-[0px_0px_100px_0px_rgba(0,0,0,0.10)]"
		);
	});

	it("renders the correct HTML structure", () => {
		render(
			<DashboardLayout>
				<div data-testid="child">Test Child</div>
			</DashboardLayout>
		);

		const layoutContainer = screen.getByTestId("main").parentElement;
		expect(layoutContainer).toHaveClass("h-screen flex pt-4 pb-4 pr-4");
	});

	// Negative Cases
	it("renders without children", () => {
		render(<DashboardLayout children={undefined} />);

		const child = screen.queryByTestId("child");
		expect(child).not.toBeInTheDocument();
	});
});
