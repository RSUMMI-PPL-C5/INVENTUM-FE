// __tests__/app/dashboard/detail-request/page.unit.test.tsx
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import RequestDetailPage from "@/app/dashboard/detail-request/page";

// Mock the next/navigation hooks
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock the RequestDetail component
jest.mock("@/modules/request-details/request-detail", () => {
  return {
    __esModule: true,
    default: ({ id, requestType }: { id: string; requestType: string }) => (
      <div data-testid="mocked-request-detail">
        Mocked Request Detail: {id} - {requestType}
      </div>
    ),
  };
});

describe("RequestDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with correct props from search params for maintenance", () => {
    // Mock the search params to return a maintenance request
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((param) => {
        if (param === "id") return "123";
        if (param === "type") return "maintenance";
        return null;
      }),
    });

    render(<RequestDetailPage />);
    
    expect(screen.getByTestId("mocked-request-detail")).toHaveTextContent(
      "Mocked Request Detail: 123 - MAINTENANCE"
    );
  });

  it("renders with correct props from search params for calibration", () => {
    // Mock the search params to return a calibration request
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((param) => {
        if (param === "id") return "456";
        if (param === "type") return "calibration";
        return null;
      }),
    });

    render(<RequestDetailPage />);
    
    expect(screen.getByTestId("mocked-request-detail")).toHaveTextContent(
      "Mocked Request Detail: 456 - CALIBRATION"
    );
  });

  it("defaults to MAINTENANCE when type is not specified", () => {
    // Mock the search params with no type
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((param) => {
        if (param === "id") return "789";
        return "";
      }),
    });

    render(<RequestDetailPage />);
    
    expect(screen.getByTestId("mocked-request-detail")).toHaveTextContent(
      "Mocked Request Detail: 789 - MAINTENANCE"
    );
  });
});