import { render, screen } from "@testing-library/react";
import React from "react";

describe("DashboardLayout", () => {
  it("renders without crashing", () => {
    render(<><div>Test</div></>);
  });

  it("renders children correctly", () => {
    render(
      <>
        <div data-testid="child-element">Test</div>
      </>
    );
    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<><div>Snapshot Test</div></>);
    expect(asFragment()).toMatchSnapshot();
  });
});