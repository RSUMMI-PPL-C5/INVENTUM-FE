import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import DivisiPage from "@/app/dashboard/division/page"

jest.mock("@/modules/division/divisi-display", () => {
  return jest.fn(() => <div data-testid="divisi-display">DivisiDisplay Component</div>)
});

describe("DivisiPage", () => {
  it("renders the DivisiDisplay component", () => {
    render(<DivisiPage />)

    // Check that DivisiDisplay component is rendered
    expect(screen.getByTestId("divisi-display")).toBeInTheDocument()
    expect(screen.getByText("DivisiDisplay Component")).toBeInTheDocument()
  })
})