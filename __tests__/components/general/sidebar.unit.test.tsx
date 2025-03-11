import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
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

describe("SideBar Component", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (usePathname as jest.Mock).mockReturnValue("/dashboard/user");
    (Cookies.get as jest.Mock).mockReturnValue("mockToken");

    render(<SideBar />);
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
    assertSidebarCollapsed();
  });

  it("expands the sidebar when hovered", () => {
    hoverSidebar();
    assertSidebarExpanded();
  });

  it("collapses the sidebar when mouse leaves", () => {
    hoverSidebar();
    leaveSidebar();
    assertSidebarCollapsed();
  });
  
  it("navigates to the correct route when a menu item is clicked if current path is not destination route", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/user");
  
    hoverSidebar();
  
    fireEvent.click(screen.getByText("Daftar Alat Medis"));
  
    expect(pushMock).toHaveBeenCalledWith("/dashboard/medical-equipment");
  });

  it("logs out when logout button is clicked", () => {
    hoverSidebar();

    fireEvent.click(screen.getByText("Keluar"));

    expect(Cookies.remove).toHaveBeenCalledWith("token");
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  // Negative Cases
  it("does not expand the sidebar if not hovered", () => {
    assertSidebarCollapsed();
  });

  it("does not navigate if a menu item is not clicked", () => {
    hoverSidebar();

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("does not collapse the sidebar if not hovered and then left", () => {
    hoverSidebar();
    leaveSidebar();

    assertSidebarCollapsed();
  });

  it("does not show menu labels when sidebar is collapsed", () => {
    assertSidebarCollapsed();
  });

  it("does not navigate to a route if the route is the same as the current path", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/user");

    hoverSidebar();

    fireEvent.click(screen.getByText("Pengguna"));

    expect(pushMock).not.toHaveBeenCalled();
  });
});
