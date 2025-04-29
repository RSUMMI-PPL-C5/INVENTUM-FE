// __tests__/modules/request-details/request-detail.unit.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequestDetail from "@/modules/request-details/request-detail";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";

// Mock the next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("RequestDetail", () => {
  const mockRouter = {
    back: jest.fn(),
  };

  const mockRequest = {
    id: "1",
    userId: "user-1",
    medicalEquipment: "Test Equipment",
    complaint: "Test complaint",
    submissionDate: "2023-05-15T10:30:00.000Z",
    status: "Pending",
    createdBy: "user-1",
    createdOn: "2023-05-15T10:30:00.000Z",
    modifiedBy: null,
    modifiedOn: "2023-05-15T10:30:00.000Z",
    requestType: "MAINTENANCE",
    user: {
      username: "testuser",
      fullname: "Test User",
    },
  };

  const mockComments = [
    {
      id: "comment-1",
      text: "Test comment 1",
      userId: "user-1",
      requestId: "1",
      createdAt: "2023-05-16T10:30:00.000Z",
      modifiedAt: "2023-05-16T10:30:00.000Z",
      user: {
        username: "testuser",
        fullname: "Test User",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
  });

  // Test loading state
  it("displays loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to maintain loading state
    );

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  // Test error state
  it("displays error state when request fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to load request details");
  });

  // Test successful data loading
  it("fetches and displays request details", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRequest,
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockComments,
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    // Check if request details are displayed
    expect(screen.getByTestId("request-id")).toHaveTextContent("1");
    expect(screen.getByTestId("request-status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("request-user")).toHaveTextContent("Test User");
    expect(screen.getByTestId("request-equipment")).toHaveTextContent("Test Equipment");
  });

  // Test back button
  it("calls router.back when back button is clicked", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRequest,
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /ArrowLeft/i }));
    
    expect(mockRouter.back).toHaveBeenCalled();
  });

  // Test adding a comment (success case)
  it("adds a comment successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRequest,
      }),
    });

    // Mock successful comment submission
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          id: "comment-2",
          text: "New comment",
          userId: "user-1",
          requestId: "1",
          createdAt: "2023-05-17T10:30:00.000Z",
          modifiedAt: "2023-05-17T10:30:00.000Z",
          user: {
            username: "testuser",
            fullname: "Test User",
          },
        },
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    // Type a new comment
    const commentInput = screen.getByTestId("comment-input");
    fireEvent.change(commentInput, { target: { value: "New comment" } });
    
    // Submit the comment
    fireEvent.click(screen.getByTestId("submit-comment"));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/comment`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            text: "New comment",
            requestId: "1",
          }),
        })
      );
    });
    
    expect(toast.success).toHaveBeenCalledWith("Comment added successfully");
  });

  // Test adding a comment (error case)
  it("handles error when adding a comment fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRequest,
      }),
    });

    // Mock failed comment submission
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    // Type a new comment
    const commentInput = screen.getByTestId("comment-input");
    fireEvent.change(commentInput, { target: { value: "New comment" } });
    
    // Submit the comment
    fireEvent.click(screen.getByTestId("submit-comment"));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to post comment");
    });
  });

  // Test when request includes comments
  it("displays comments included in the request response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockRequest,
          comments: mockComments,
        },
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Test comment 1")).toBeInTheDocument();
  });

  // Test no comments case
  it("displays 'No comments yet' when there are no comments", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRequest,
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.getByText("No comments yet")).toBeInTheDocument();
    });
  });

  // Test invalid response format
  it("handles invalid response format", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: false,
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.getByText("Invalid response format")).toBeInTheDocument();
    });
  });

  // Test empty complaint handling
  it("displays placeholder when complaint is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockRequest,
          complaint: null,
        },
      }),
    });

    render(<RequestDetail id="1" requestType="MAINTENANCE" />);
    
    await waitFor(() => {
      expect(screen.getByText("No complaint specified")).toBeInTheDocument();
    });
  });

  // Test different status colors
  it("applies correct status styling", async () => {
    const statuses = [
      { status: "Pending", class: "bg-yellow-100" },
      { status: "Approved", class: "bg-green-100" },
      { status: "Rejected", class: "bg-red-100" },
      { status: "Other", class: "bg-gray-100" },
    ];

    for (const { status, class: className } of statuses) {
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            ...mockRequest,
            status,
          },
        }),
      });

      const { unmount } = render(<RequestDetail id="1" requestType="MAINTENANCE" />);
      
      await waitFor(() => {
        const statusElement = screen.getByTestId("request-status");
        expect(statusElement).toHaveClass(className);
      });

      unmount();
    }
  });

  // Test calibration request type
  it("displays Calibration title for calibration requests", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockRequest,
      }),
    });

    render(<RequestDetail id="1" requestType="CALIBRATION" />);
    
    await waitFor(() => {
      expect(screen.getByText("Calibration Request Detail")).toBeInTheDocument();
    });
  });
});