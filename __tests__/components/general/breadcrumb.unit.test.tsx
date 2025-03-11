import React from "react";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import Breadcrumb from "@/components/general/breadcrumb";

// Mock next/navigation and react-iconly
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("react-iconly", () => ({
  Notification: jest.fn(() => <div data-testid="notification-icon" />),
}));

describe("Breadcrumb Component", () => {
  // Positive Cases
  it("renders breadcrumb for /dashboard/user", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/user");

    render(<Breadcrumb />);

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByTestId("notification-icon")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  // Negative Cases
  it("does not render breadcrumb for invalid path", () => {
    (usePathname as jest.Mock).mockReturnValue("/invalid-path");

    render(<Breadcrumb />);

    expect(screen.queryByText("User")).not.toBeInTheDocument();
    expect(screen.queryByText("Medical Equipment")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.getByTestId("notification-icon")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});