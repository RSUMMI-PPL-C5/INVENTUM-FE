import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/dashboard/layout";
import React from "react";

describe("DashboardLayout", () => {
  it("renders without crashing", () => {
    render(<DashboardLayout><div>Test</div></DashboardLayout>);
  });

  it("renders children correctly", () => {
    render(
      <DashboardLayout>
        <div data-testid="child-element">Test</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<DashboardLayout><div>Snapshot Test</div></DashboardLayout>);
    expect(asFragment()).toMatchSnapshot();
  });
});