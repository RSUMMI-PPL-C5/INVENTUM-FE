import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import SideBar from "@/components/general/sidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("SideBar Component", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (usePathname as jest.Mock).mockReturnValue("/dashboard/user");

    render(<SideBar />);
  });

  // Helper functions
  const getSidebar = () => screen.getByTestId("sidebar");
  const hoverSidebar = () => fireEvent.mouseEnter(getSidebar());
  const leaveSidebar = () => fireEvent.mouseLeave(getSidebar());

  const assertSidebarCollapsed = () => {
    const sidebar = getSidebar();
    expect(sidebar).not.toHaveClass("w-72");
    expect(screen.getByText("IN")).toBeInTheDocument();
    expect(screen.queryAllByText(/Pengguna|Daftar Alat Medis|Daftar Suku Cadang/).length).toBe(0);
  };

  const assertSidebarExpanded = () => {
    const sidebar = getSidebar();
    expect(sidebar).toHaveClass("w-72");
    expect(screen.getByText("INVENTUM")).toBeInTheDocument();
    expect(screen.queryAllByText(/Pengguna|Daftar Alat Medis|Daftar Suku Cadang/).length).toBeGreaterThan(0);
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

  it("renders the user info when expanded", () => {
    hoverSidebar();
    expect(screen.getByText("Azmy Arya Rizaldi")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders the logout button", () => {
    hoverSidebar();
    expect(screen.getByText("Keluar")).toBeInTheDocument();
  });

  it("navigates to the correct route when a button is clicked", () => {
    hoverSidebar();
    const userButton = screen.getByText("Pengguna");
    fireEvent.click(userButton);
    expect(pushMock).toHaveBeenCalledWith("/dashboard/user");
  });

  // Negative Cases
  it("does not expand the sidebar if hover event is not triggered", () => {
    assertSidebarCollapsed();
  });

  it("does not render user info when sidebar is collapsed", () => {
    expect(screen.queryByText("Azmy Arya Rizaldi")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("does not render logout button when sidebar is collapsed", () => {
    expect(screen.queryByText("Keluar")).not.toBeInTheDocument();
  });

  it("does not navigate if a button is not clicked", () => {
    hoverSidebar();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("does not render sidebar links when sidebar is collapsed", () => {
    expect(screen.queryByText("Pengguna")).not.toBeInTheDocument();
    expect(screen.queryByText("Daftar Alat Medis")).not.toBeInTheDocument();
    expect(screen.queryByText("Daftar Suku Cadang")).not.toBeInTheDocument();
  });

  it("does not render sidebar links if pathname is not provided", () => {
    (usePathname as jest.Mock).mockReturnValue(undefined);

    render(<SideBar />);
    expect(screen.queryByText("Pengguna")).not.toBeInTheDocument();
    expect(screen.queryByText("Daftar Alat Medis")).not.toBeInTheDocument();
    expect(screen.queryByText("Daftar Suku Cadang")).not.toBeInTheDocument();
  });
});