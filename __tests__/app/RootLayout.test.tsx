import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout"; // Sesuaikan path jika berbeda
import React from "react";

// Mock metadata object
jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({ variable: "--mock-geist-sans" })),
  Geist_Mono: jest.fn(() => ({ variable: "--mock-geist-mono" })),
}));

describe("RootLayout", () => {
  it("renders without crashing", () => {
    render(<RootLayout><div>Test</div></RootLayout>);
  });

  it("renders children correctly", () => {
    render(
      <RootLayout>
        <div data-testid="child-element">Test Child</div>
      </RootLayout>
    );
    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });

  it("applies the correct font classes", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    expect(document.body).toHaveClass(
      "--mock-geist-sans --mock-geist-mono antialiased"
    );
  });

  it("sets the correct HTML language attribute", () => {
    const { baseElement } = render(<RootLayout><div>Test</div></RootLayout>);
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<RootLayout><div>Snapshot Test</div></RootLayout>);
    expect(asFragment()).toMatchSnapshot();
  });
});