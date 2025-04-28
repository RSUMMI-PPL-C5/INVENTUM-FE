import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MaintenanceRequestCreate from '@/modules/medical-equipment/request/maintenance/maintenance-request-create';
import { useRouter, useParams } from 'next/navigation';
import Cookies from "js-cookie";

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

describe('MaintenanceRequestCreatePage', () => {
  let mockPush: jest.Mock;
  let mockBack: jest.Mock;
  let mockUseParams: jest.Mock;

  beforeEach(() => {
    mockBack = jest.fn();
    mockPush = jest.fn();
    mockUseParams = jest.fn().mockReturnValue({ id: "1" });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
    (useParams as jest.Mock).mockImplementation(mockUseParams);
    (Cookies.get as jest.Mock).mockReturnValue("mock-token");

    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === `${process.env.NEXT_PUBLIC_API_URL}/request/maintenance`) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      } else if (url === `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/1`) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { name: "mock-equipment-name" } }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page correctly', async () => {
    render(<MaintenanceRequestCreate />);
    
    expect(screen.getByText('Kembali')).toBeInTheDocument();
    expect(screen.getByText('Minta Maintenance')).toBeInTheDocument();
    expect(screen.getByLabelText(/Alat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catatan/i)).toBeInTheDocument();
    expect(screen.getByText('Batalkan')).toBeInTheDocument();
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });
  });

  it('should go back when the kembali button is clicked', () => {
    render(<MaintenanceRequestCreate />);
    
    const backButton = screen.getByText('Kembali');
    backButton.click();
    
    expect(mockBack).toHaveBeenCalled();
  });

  it('should go back when the batalkan button is clicked', () => {
    render(<MaintenanceRequestCreate />);
    
    const cancelButton = screen.getByText('Batalkan');
    cancelButton.click();
    
    expect(mockBack).toHaveBeenCalled();
  });
  
  it('should handle missing token', async () => {
    (Cookies.get as jest.Mock).mockReturnValueOnce(null);
    console.error = jest.fn();

    render(<MaintenanceRequestCreate />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('should call the API to fetch medical equipment name', async () => {
    render(<MaintenanceRequestCreate />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/1`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
          },
        })
      );
    });
  });
  
  it('should handle error when fetching medical equipment name fails', async () => {
    global.fetch = jest.fn().mockImplementationOnce((url) => 
      url === `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/1` 
        ? Promise.resolve({
            ok: false,
            json: () => Promise.resolve({}),
          })
        : Promise.resolve()
    );
    console.error = jest.fn();

    render(<MaintenanceRequestCreate />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching medical equipment name:', 
        expect.any(Error));
    });
  });
  
  it('should open the error modal when there is an error and closed when get clicked', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === `${process.env.NEXT_PUBLIC_API_URL}/request/maintenance`) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        });
      } else if (url === `${process.env.NEXT_PUBLIC_API_URL}/medical-equipment/1`) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { name: "mock-equipment-name" } }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    });

    render(<MaintenanceRequestCreate />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Catatan/i), {
        target: { value: 'Test complaint' }
      });
      fireEvent.click(screen.getByText('Simpan'));
    });

    await waitFor(() => {
      expect(screen.getAllByText('Failed to create maintenance request')).toHaveLength(2);
    });

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      const errorTexts = screen.getAllByText('Failed to create maintenance request');
      expect(errorTexts).toHaveLength(1);
    });
  });
  
  it('should submit the form successfully', async () => {
    render(<MaintenanceRequestCreate />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Catatan/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Catatan/i), {
      target: { value: 'Valid complaint' }
    });

    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/request/maintenance`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
          },
          body: expect.any(String)
        })
      );
      expect(mockPush).toHaveBeenCalledWith(
        '/dashboard/medical-equipment/1?success=true'
      );
    });
  });
});
