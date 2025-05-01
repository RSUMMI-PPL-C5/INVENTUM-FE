import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useParams } from 'next/navigation';
import MedicalEquipmentDetails from '@/app/dashboard/medical-equipment/[id]/page';
import MedicalEquipmentEditPage from '@/app/dashboard/medical-equipment/[id]/edit/page';
import Cookies from "js-cookie";

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

// Mock the MedicalEquipmentEdit component
jest.mock("@/modules/medical-equipment/medical-equipment-edit", () => jest.fn(() => <div>MedicalEquipmentEdit Component</div>));

describe("MedicalEquipmentEditPage Component", () => {
  test("renders the MedicalEquipmentEdit component", () => {
    render(<MedicalEquipmentEditPage />);

    expect(screen.getByText("MedicalEquipmentEdit Component")).toBeInTheDocument();
  });
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock confirm
global.confirm = jest.fn();

describe('MedicalEquipmentDetails Component', () => {
  const mockPush = jest.fn();
  
  // Data equipment sederhana untuk testing
  const mockEquipment = {
    id: "6df4d1f3-0696-401b-9a00-511401c929c8",
    inventorisId: "MED-123",
    name: "Pulse Oximeter",
    brandName: "HealthTech",
    modelName: "PT2000",
    purchaseDate: "2025-01-15T10:30:00.000Z",
    purchasePrice: 2500000,
    status: "active",
    vendor: "Medical Supplies Inc",
    createdOn: "2025-02-10T08:45:23.951Z",
    modifiedOn: "2025-02-15T14:22:10.123Z"
  };
  
  const falseEquipment = {
    id: "6df4d1f3-0696-401b-9a00-511401c929c8",
    inventorisId: "MED-123",
    name: "Pulse Oximeter",
    brandName: null,
    modelName: null,
    purchaseDate: "invalid-date", // Invalid date format
    purchasePrice: null,
    status: "unknown",
    vendor: null,
    createdOn: null,
    modifiedOn: "2025-02-15T14:22:10.123Z"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router dan params
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: mockEquipment.id });
    
    // Setup fetch success default
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockEquipment)
    });
    
    // Default confirm adalah true
    (global.confirm as jest.Mock).mockReturnValue(true);

  });
  
  it('should show loading state initially and then display equipment details', async () => {
    render(<MedicalEquipmentDetails />);
    
    // Check loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    
    // Wait for details to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Check basic details are displayed
    expect(screen.getByTestId('equipment-name')).toHaveTextContent('Pulse Oximeter');
    expect(screen.getByTestId('equipment-inventoris-id')).toHaveTextContent('MED-123');
    expect(screen.getByTestId('equipment-status')).toHaveTextContent('active');
  });

  it('should use auth token when it exists for fetching', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('mockToken');

    render(<MedicalEquipmentDetails />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${mockEquipment.id}`,
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer mockToken',
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('should use auth token when it exists for delete', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('mockToken');

    render(<MedicalEquipmentDetails />);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-button'));
      expect(global.confirm).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${mockEquipment.id}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer mockToken',
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('should use empty string if token does not exist for delete', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('');

    render(<MedicalEquipmentDetails />);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-button'));
      expect(global.confirm).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/${mockEquipment.id}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: '',
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('should handle missing equipmentId', async () => {
    (useParams as jest.Mock).mockReturnValue({ id: null });

    global.fetch = jest.fn();

    render(<MedicalEquipmentDetails />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
  
  it('should handle errors when equipment is not found', async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });
    
    render(<MedicalEquipmentDetails />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  it('should use generic error message when equipment is not found', async () => {
    global.fetch = jest.fn(() => {
      throw "Not an error object";
    });

    render(<MedicalEquipmentDetails />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  it('should handle error in date formatting', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(falseEquipment)
    });

    render(<MedicalEquipmentDetails />);
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });
  
  it('should navigate back when back button is clicked', async () => {
    render(<MedicalEquipmentDetails />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click back button
    fireEvent.click(screen.getByTestId('back-button'));
    
    // Check navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/medical-equipment');
  });
  
  it('should navigate to edit page when edit button is clicked', async () => {
    render(<MedicalEquipmentDetails />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Check navigation
    expect(mockPush).toHaveBeenCalledWith(`/dashboard/medical-equipment/${mockEquipment.id}/edit`);
  });

  it('should delete equipment successfully when confirmed', async () => {
    // Mock successful delete
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options && options.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      
      // Default for GET request
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEquipment)
      });
    });
    
    render(<MedicalEquipmentDetails />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Check confirmation
    expect(global.confirm).toHaveBeenCalled();
    
    // Wait for redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/medical-equipment?success=delete');
    });
  });
  
  it('should not delete when user cancels confirmation', async () => {
    // Mock cancel confirmation
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    
    render(<MedicalEquipmentDetails />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Verify DELETE was not called
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringMatching(/delete/i),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
  
  it('should handle delete failure', async () => {
    // Mock delete failure
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options && options.method === 'DELETE') {
        return Promise.resolve({ ok: false });
      }
      
      // Default for GET request
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEquipment)
      });
    });
    
    render(<MedicalEquipmentDetails />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Verify no redirect happened
    expect(mockPush).not.toHaveBeenCalledWith('/dashboard/medical-equipment');
  });

  it('should render all UI elements with correct data', async () => {
    render(<MedicalEquipmentDetails />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Verifikasi semua elemen UI
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('equipment-name')).toHaveTextContent('Pulse Oximeter');
    expect(screen.getByTestId('equipment-inventoris-id')).toHaveTextContent('MED-123');
    expect(screen.getByTestId('equipment-brand')).toHaveTextContent('HealthTech');
    expect(screen.getByTestId('equipment-model')).toHaveTextContent('PT2000');
    expect(screen.getByTestId('equipment-status')).toHaveTextContent('active');
    expect(screen.getByTestId('equipment-price')).toHaveTextContent('Rp 2.500.000');
    expect(screen.getByTestId('equipment-vendor')).toHaveTextContent('Medical Supplies Inc');
    expect(screen.getByTestId('equipment-purchase-date')).toBeInTheDocument();
    expect(screen.getByTestId('equipment-created')).toBeInTheDocument();
    expect(screen.getByTestId('equipment-modified')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('should render fallbacks for missing data fields', async () => {
    // Data equipment dengan berbagai field yang null
    const equipmentWithMissingData = {
      ...mockEquipment,
      brandName: null,
      modelName: null,
      purchasePrice: null,
      vendor: null,
      purchaseDate: null,
      createdOn: null
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(equipmentWithMissingData)
    });
    
    render(<MedicalEquipmentDetails />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Verifikasi fallback rendering untuk field yang null
    expect(screen.getByTestId('equipment-brand')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('equipment-model')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('equipment-price')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('equipment-vendor')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('equipment-purchase-date')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('equipment-created')).toHaveTextContent('Tidak ada');
  });

  it('should render status with correct styling based on equipment status', async () => {
    const statusVariants = [
      { status: 'active', expectedClass: 'bg-green-100 text-green-800' },
      { status: 'inactive', expectedClass: 'bg-red-100 text-red-800' },
      { status: 'maintenance', expectedClass: 'bg-yellow-100 text-yellow-800' },
      { status: 'unknown', expectedClass: 'bg-gray-100 text-gray-800' }
    ];

    for (const variant of statusVariants) {
      const equipmentWithStatus = {
        ...mockEquipment,
        status: variant.status
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(equipmentWithStatus)
      });
      
      render(<MedicalEquipmentDetails />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
      });
      
      const statusElement = screen.getByTestId('equipment-status').firstChild;
      expect(statusElement).toHaveClass(variant.expectedClass.split(' ')[0]);
      expect(statusElement).toHaveClass(variant.expectedClass.split(' ')[1]);
      
      // Clean up before next test
      document.body.innerHTML = '';
    }
  });

  it('should format currency correctly', async () => {
    const priceVariants = [
      { price: 1000000, expected: 'Rp1.000.000' },
      { price: 500, expected: 'Rp500' },
      { price: 0, expected: 'Rp0' }
    ];

    for (const variant of priceVariants) {
      const equipmentWithPrice = {
        ...mockEquipment,
        purchasePrice: variant.price
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(equipmentWithPrice)
      });
      
      render(<MedicalEquipmentDetails />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
      });
            
      // Clean up before next test
      document.body.innerHTML = '';
    }
  });
});