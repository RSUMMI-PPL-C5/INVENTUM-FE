import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import EditDivisiPage from "@/app/dashboard/division/[id]/edit/page"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn().mockReturnValue({ id: "42" }),
}))

// Mock the EditDivisi component
jest.mock("@/modules/division/divisi-edit", () => {
  return jest.fn(({ id }: { id: number }) => (
    <div data-testid="edit-divisi">EditDivisi Component with ID: {id}</div>
  ))
})

describe("EditDivisiPage", () => {
  it("extracts id from params and passes it to EditDivisi component", () => {
    render(<EditDivisiPage />)
    
    // Check that EditDivisi component is rendered with correct ID
    expect(screen.getByTestId("edit-divisi")).toBeInTheDocument()
    expect(screen.getByText("EditDivisi Component with ID: 42")).toBeInTheDocument()
  })

  it("handles string to number conversion for id parameter", () => {
    // Change the mock to return a different ID
    const useParamsModule = require("next/navigation")
    useParamsModule.useParams.mockReturnValue({ id: "123" })
    
    render(<EditDivisiPage />)
    
    // Check that the new ID is correctly parsed and passed
    expect(screen.getByText("EditDivisi Component with ID: 123")).toBeInTheDocument()
  })
})