import React, { use } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import { decodeToken } from "@/lib/utils";
import SideBar from "@/components/general/sidebar";
import Cookies from "js-cookie";

jest.mock("next/navigation", () => ({
	useRouter: jest.fn(),
	usePathname: jest.fn(),
}));

jest.mock("js-cookie", () => ({
	get: jest.fn(),
	remove: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
	cn: jest.fn((...inputs) => inputs.filter(Boolean).join(" ")),
	decodeToken: jest.fn(),
}));

global.fetch = jest.fn();

describe("SideBar Component", () => {
	let pushMock: jest.Mock;

	beforeEach(() => {
		pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({ push: pushMock });
		(usePathname as jest.Mock).mockReturnValue("/dashboard/user");
		(Cookies.get as jest.Mock).mockReturnValue("mockToken");
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	// Helper functions
	const getSidebar = () => screen.getByTestId("sidebar");
	const hoverSidebar = () => fireEvent.mouseEnter(getSidebar());
	const leaveSidebar = () => fireEvent.mouseLeave(getSidebar());

	const assertSidebarCollapsed = () => {
		expect(getSidebar()).not.toHaveClass("w-72");
		expect(screen.getByText("IN")).toBeInTheDocument();
		expect(screen.queryByText("Pengguna")).not.toBeInTheDocument();
		expect(screen.queryByText("Keluar")).not.toBeInTheDocument();
	};

	const assertSidebarExpanded = () => {
		expect(getSidebar()).toHaveClass("w-72");
		expect(screen.getByText("INVENTUM")).toBeInTheDocument();
		expect(screen.getByText("Pengguna")).toBeInTheDocument();
		expect(screen.getByText("Keluar")).toBeInTheDocument();
	};

	// Positive Cases
	it("renders the sidebar with collapsed state by default", () => {
		render(<SideBar />);
		assertSidebarCollapsed();
	});

	it("expands the sidebar when hovered", () => {
		render(<SideBar />);
		hoverSidebar();
		assertSidebarExpanded();
	});

	it("collapses the sidebar when mouse leaves", () => {
		render(<SideBar />);
		hoverSidebar();
		leaveSidebar();
		assertSidebarCollapsed();
	});

	it("navigates to the correct route when a menu item is clicked if current path is not destination route", () => {
		render(<SideBar />);
		(usePathname as jest.Mock).mockReturnValue("/dashboard/user");

		hoverSidebar();

		fireEvent.click(screen.getByText("Daftar Alat Medis"));

		expect(pushMock).toHaveBeenCalledWith("/dashboard/medical-equipment");
	});

	it("logs out when logout button is clicked", () => {
		render(<SideBar />);
		hoverSidebar();

		fireEvent.click(screen.getByText("Keluar"));

		expect(Cookies.remove).toHaveBeenCalledWith("accessToken");
		expect(pushMock).toHaveBeenCalledWith("/");
	});

	it("fetches user data", async () => {
		(Cookies.get as jest.Mock).mockReturnValue("mockToken");
		(decodeToken as jest.Mock).mockReturnValue({
			userId: "ef3f4f15-a43c-48b8-8ff0-5c4c6059996d",
		});

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: jest.fn().mockResolvedValue({
				username: "admin",
			}),
		});

		render(<SideBar />);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.NEXT_PUBLIC_API_URL}/user/ef3f4f15-a43c-48b8-8ff0-5c4c6059996d`,
				expect.objectContaining({
					method: "GET",
					headers: {
						Authorization: "Bearer mockToken",
						"Content-Type": "application/json",
					},
				})
			);
		});
	});

	it("shows loading state while fetching user data", async () => {
		(Cookies.get as jest.Mock).mockReturnValue("mockToken");
		(decodeToken as jest.Mock).mockReturnValue({
			userId: "ef3f4f15-a43c-48b8-8ff0-5c4c6059996d",
		});

		let resolveFetch: any;
		(global.fetch as jest.Mock).mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					resolveFetch = () =>
						resolve({
							ok: true,
							json: () =>
								Promise.resolve({
									fullname: "Admin RS Ummi",
									role: "Admin",
								}),
						});
				})
		);

		render(<SideBar />);

		hoverSidebar();

		expect(screen.getByText("Loading...")).toBeInTheDocument();

		resolveFetch();
		await waitFor(() => {
			expect(screen.getByText("Admin RS Ummi")).toBeInTheDocument();
			expect(screen.getByText("Admin")).toBeInTheDocument();
		});
	});

	// Negative Cases
	it("does not expand the sidebar if not hovered", () => {
		render(<SideBar />);
		assertSidebarCollapsed();
	});

	it("does not navigate if a menu item is not clicked", () => {
		render(<SideBar />);
		hoverSidebar();

		expect(pushMock).not.toHaveBeenCalled();
	});

	it("does not collapse the sidebar if not hovered and then left", () => {
		render(<SideBar />);
		hoverSidebar();
		leaveSidebar();

		assertSidebarCollapsed();
	});

	it("does not show menu labels when sidebar is collapsed", () => {
		render(<SideBar />);
		assertSidebarCollapsed();
	});

	it("does not navigate to a route if the route is the same as the current path", () => {
		render(<SideBar />);
		(usePathname as jest.Mock).mockReturnValue("/dashboard/user");

		hoverSidebar();

		fireEvent.click(screen.getByText("Pengguna"));

		expect(pushMock).not.toHaveBeenCalled();
	});

	it("handles invalid token", () => {
		(Cookies.get as jest.Mock).mockReturnValue(null);

		const errorSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		render(<SideBar />);

		expect(Cookies.get).toHaveBeenCalledWith("accessToken");
		expect(console.error).toHaveBeenCalledWith("No token found");

		errorSpy.mockRestore();
	});

	it("throws an error if response is not ok", async () => {
		(Cookies.get as jest.Mock).mockReturnValue("mockToken");
		(decodeToken as jest.Mock).mockReturnValue({
			userId: "ef3f4f15-a43c-48b8-8ff0-5c4c6059996d",
		});

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: "Not Found",
			json: jest.fn(),
		});

		const errorSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		render(<SideBar />);

		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith(
				"Error fetching user data:",
				expect.objectContaining({
					message: "Failed to fetch user data",
				})
			);
		});

		errorSpy.mockRestore();
	});

	it("shows fallback values when user data is null", async () => {
		(Cookies.get as jest.Mock).mockReturnValue("mockToken");
		(decodeToken as jest.Mock).mockReturnValue({ userId: "some-id" });

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => null,
		});

		render(<SideBar />);
		hoverSidebar();

		await waitFor(() => {
			expect(screen.getByText("User")).toBeInTheDocument();
			expect(screen.getByText("Guest")).toBeInTheDocument();
		});
	});
});
