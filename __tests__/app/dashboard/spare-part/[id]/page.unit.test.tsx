
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import SparePartDetailsPage from '@/app/dashboard/spare-part/[id]/page';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

// Set the API URL for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';
});

// Mock router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: 'test-id-123',
  })),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn().mockReturnValue("mock-token"),
}));

// Mock confirm
global.confirm = jest.fn();

describe('SparePartDetailsPage', () => {
  // Mock sparepart data
  const mockSparepartData = {
    id: 'test-id-123',
    partsName: 'Test Spare Part',
    purchaseDate: '2023-05-15T00:00:00.000Z',
    price: 150000,
    toolLocation: 'Test Location',
    description: 'Test description for the spare part'
  };

  beforeEach(() => {
    // Set up fetch mock
    global.fetch = jest.fn();
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    mockPush.mockClear();
    (toast.error as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering test
  it('renders the loading state initially', async () => {
    // Set up the fetch mock BEFORE rendering the component
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockSparepartData)
      }), 100))
    );
    
    // Render the component
    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });
    
    // Check for loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
  });

  // Test loading state
  it('displays loading state while fetching data', async () => {
    // Mock a delayed response to show loading state
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => 
        resolve({
          ok: true,
          json: async () => mockSparepartData,
        }), 100))
    );

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });
    
    // Loading state should be shown
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText(/Memuat/i)).toBeInTheDocument();
  });

  // Test successful data fetching
  it('fetches and displays spare part details', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/spareparts/test-id-123`,
      expect.objectContaining({
        headers: {
          Authorization: "Bearer mock-token",
          "Content-Type": "application/json",
        },
      })
    );

    // Verify data display
    expect(screen.getByTestId('spare-part-name')).toHaveTextContent('Test Spare Part');
    expect(screen.getByTestId('spare-part-price')).toHaveTextContent('Rp 150.000');
    expect(screen.getByTestId('spare-part-location')).toHaveTextContent('Test Location');
    expect(screen.getByTestId('spare-part-date')).toHaveTextContent('15 Mei 2023');
    expect(screen.getByTestId('spare-part-description')).toHaveTextContent('Test description');
  });

  // Test back button navigation
  it('navigates back when back button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Click back button
    fireEvent.click(screen.getByTestId('back-button'));

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/spare-part');
  });

  // Test edit button navigation
  it('navigates to edit page when edit button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByTestId('edit-button'));

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/spare-part/test-id-123/edit');
  });

  // Test delete functionality
  it('shows confirmation dialog and deletes spare part when confirmed', async () => {
    // Mock confirmation to be true
    (global.confirm as jest.Mock).mockReturnValueOnce(true);

    // Mock successful fetch for initial load
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    // Mock successful delete
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Click delete button
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-button'));
    });

    // Verify confirmation dialog was shown
    expect(global.confirm).toHaveBeenCalledWith(
      "Apakah Anda yakin ingin menghapus suku cadang ini?"
    );

    // Verify delete request was made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/spareparts/test-id-123`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            Authorization: "Bearer mock-token",
            "Content-Type": "application/json",
          },
        })
      );
    });

    // Verify navigation after successful delete
    expect(mockPush).toHaveBeenCalledWith("/dashboard/spare-part?success=delete");
  });

  // Test cancel delete
  it('does not delete spare part when confirmation is canceled', async () => {
    // Mock confirmation to be false
    (global.confirm as jest.Mock).mockReturnValueOnce(false);

    // Mock successful fetch for initial load
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Clear previous fetch calls
    (global.fetch as jest.Mock).mockClear();

    // Click delete button
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-button'));
    });

    // Verify confirmation dialog was shown
    expect(global.confirm).toHaveBeenCalledWith(
      "Apakah Anda yakin ingin menghapus suku cadang ini?"
    );

    // Verify no delete request was made
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/spareparts/test-id-123"),
      expect.objectContaining({
        method: "DELETE",
      })
    );

    // Verify no navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Test delete error handling
  it('shows error toast when delete fails', async () => {
    // Mock confirmation to be true
    (global.confirm as jest.Mock).mockReturnValueOnce(true);

    // Mock successful fetch for initial load
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    // Mock failed delete
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Failed to delete spare part" }),
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Click delete button
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-button'));
    });

    // Verify error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Gagal menghapus suku cadang");
    });

    // Verify no navigation occurred
    expect(mockPush).not.toHaveBeenCalledWith("/dashboard/spare-part?success=delete");
  });

  // Test error state when fetch fails
  it('shows error state when fetch fails', async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Spare part not found" }),
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for error state to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    // Verify toast was shown
    expect(toast.error).toHaveBeenCalledWith("Suku cadang tidak ditemukan");
  });

  // Test formatting functions
  it('formats dates and currencies correctly', async () => {
    // Use a fixed date to avoid timezone issues in tests
    const sparepartWithFormattingTest = {
      ...mockSparepartData,
      // Use a date that will be the same in any timezone
      purchaseDate: '2023-10-15T12:00:00.000Z', // October 15, 2023
      price: 1250500
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sparepartWithFormattingTest,
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Check for the price only, since date format is locale-dependent
    expect(screen.getByTestId('spare-part-price')).toHaveTextContent('Rp 1.250.500');
    
    // For date, check for the correct month and year since the day might display differently in various timezones
    const dateElement = screen.getByTestId('spare-part-date');
    expect(dateElement.textContent).toContain('15');
    expect(dateElement.textContent).toContain('Oktober');
    expect(dateElement.textContent).toContain('2023');
  });

  // Test null description handling
  it('handles null description properly', async () => {
    const sparepartWithoutDescription = {
      ...mockSparepartData,
      description: null
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sparepartWithoutDescription,
    });

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Verify "No description" text is shown
    expect(screen.getByTestId('spare-part-description')).toHaveTextContent('Tidak ada deskripsi');
  });

  // Test for handling date formatting errors - to cover lines 104-105
  it('handles date formatting errors', async () => {
    // Create a sparepart with an intentionally invalid date format
    const sparepartWithInvalidDate = {
      ...mockSparepartData,
      purchaseDate: 'not-a-date' // This will cause the Date constructor to throw
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => sparepartWithInvalidDate,
    });

    // Spy on console.error to verify it's called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await act(async () => {
      render(<SparePartDetailsPage params={{ id: 'test-id-123' }} />);
    });

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Verify "Tanggal tidak valid" text is shown
    expect(screen.getByTestId('spare-part-date')).toHaveTextContent('Tanggal tidak valid');
    
    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });
});