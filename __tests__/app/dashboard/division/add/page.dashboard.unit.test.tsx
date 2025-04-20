import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import AddDivisiPage from "@/app/dashboard/division/add/page"

// Mock the AddDivisi component
jest.mock("@/modules/division/add-divisi", () => {
  return jest.fn(() => <div data-testid="add-divisi">AddDivisi Component</div>)
})

describe("AddDivisiPage", () => {
  it("renders the AddDivisi component", () => {
    render(<AddDivisiPage />)
    
    // Check that AddDivisi component is rendered
    expect(screen.getByTestId("add-divisi")).toBeInTheDocument()
    expect(screen.getByText("AddDivisi Component")).toBeInTheDocument()
  })
})