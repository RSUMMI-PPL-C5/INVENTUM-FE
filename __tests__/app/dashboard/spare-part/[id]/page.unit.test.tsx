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
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
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

// Mock console.error to reduce test noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// Mock confirm
global.confirm = jest.fn();

describe('SparePartDetailsPage', () => {
  // Mock sparepart data
  const mockSparepartData = {
    data: {
      id: 'test-id-123',
      partsName: 'Test Spare Part',
      purchaseDate: '2023-05-15T00:00:00.000Z',
      price: 150000,
      toolLocation: 'Test Location',
      description: 'Test description for the spare part'
    }
  };

  beforeEach(() => {
    // Set up fetch mock
    global.fetch = jest.fn();
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");
    
    // Clear all mocks before each test
    mockPush.mockClear();
    mockBack.mockClear();
    (toast.error as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockClear();
  });

  // Basic rendering test
  it('renders the loading state initially', async () => {
    // Set up the fetch mock to delay resolution to ensure we see loading state
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockSparepartData)
      }), 100))
    );
    
    // Render the component
    render(<SparePartDetailsPage />);
    
    // Check for loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
  });

  // Test successful data fetching
  it('fetches and displays spare part details', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    render(<SparePartDetailsPage />);

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
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    render(<SparePartDetailsPage />);

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
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSparepartData,
    });

    render(<SparePartDetailsPage />);

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

    render(<SparePartDetailsPage />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

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

    render(<SparePartDetailsPage />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Clear previous fetch calls
    (global.fetch as jest.Mock).mockClear();

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify confirmation dialog was shown
    expect(global.confirm).toHaveBeenCalledWith(
      "Apakah Anda yakin ingin menghapus suku cadang ini?"
    );

    // Verify no delete request was made
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Test error handling on delete
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
      json: async () => ({ message: "Delete failed" }),
    });

    render(<SparePartDetailsPage />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify confirmation dialog was shown
    expect(global.confirm).toHaveBeenCalledWith(
      "Apakah Anda yakin ingin menghapus suku cadang ini?"
    );

    // Verify error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Verify no navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Test date and currency formatting
  it('formats dates and currencies correctly', async () => {
    const formattedData = {
      data: {
        ...mockSparepartData.data,
        purchaseDate: '2023-05-15T00:00:00.000Z',
        price: 150000
      }
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => formattedData,
    });

    render(<SparePartDetailsPage />);

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Verify formatted values
    expect(screen.getByTestId('spare-part-date')).toHaveTextContent('15 Mei 2023');
    expect(screen.getByTestId('spare-part-price')).toHaveTextContent('Rp 150.000');
  });

  // Test null description handling
  it('handles null description properly', async () => {
    const nullDescData = {
      data: {
        ...mockSparepartData.data,
        description: null
      }
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => nullDescData,
    });

    render(<SparePartDetailsPage />);

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Verify fallback text is displayed
    expect(screen.getByTestId('spare-part-description')).toHaveTextContent('Tidak ada deskripsi');
  });

  // Test date formatting error handling
  it('handles date formatting errors', async () => {
    const invalidDateData = {
      data: {
        ...mockSparepartData.data,
        purchaseDate: 'invalid-date'
      }
    };

    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidDateData,
    });

    render(<SparePartDetailsPage />);

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('spare-part-detail')).toBeInTheDocument();
    });

    // Verify fallback text is displayed
    expect(screen.getByTestId('spare-part-date')).toHaveTextContent('Tanggal tidak valid');
  });
});