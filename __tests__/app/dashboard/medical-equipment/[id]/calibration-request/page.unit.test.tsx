import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CalibrationRequestCreate from '@/modules/medical-equipment/request/calibration/calibration-request-create';
import { useRouter, useParams } from 'next/navigation';
import Cookies from "js-cookie";
import Page from '@/app/dashboard/medical-equipment/[id]/calibration-request/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

describe('CalibrationRequestCreatePage', () => {
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
      if (url === `${process.env.NEXT_PUBLIC_API_URL}/request/calibration`) {
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
    render(<CalibrationRequestCreate />);
    
    expect(screen.getByText('Kembali')).toBeInTheDocument();
    expect(screen.getByText('Minta Calibration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Alat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catatan/i)).toBeInTheDocument();
    expect(screen.getByText('Batalkan')).toBeInTheDocument();
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });
  });

  it('should go back when the kembali button is clicked', () => {
    render(<CalibrationRequestCreate />);
    
    const backButton = screen.getByText('Kembali');
    backButton.click();
    
    expect(mockBack).toHaveBeenCalled();
  });

  it('should go back when the batalkan button is clicked', () => {
    render(<CalibrationRequestCreate />);
    
    const cancelButton = screen.getByText('Batalkan');
    cancelButton.click();
    
    expect(mockBack).toHaveBeenCalled();
  });
  
  it('should handle missing token', async () => {
    (Cookies.get as jest.Mock).mockReturnValueOnce(null);
    console.error = jest.fn();

    render(<CalibrationRequestCreate />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('should call the API to fetch medical equipment name', async () => {
    render(<CalibrationRequestCreate />);

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

    render(<CalibrationRequestCreate />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching medical equipment name:', 
        expect.any(Error));
    });
  });
  
  it('should open the error modal when there is an error and closed when get clicked', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === `${process.env.NEXT_PUBLIC_API_URL}/request/calibration`) {
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

    render(<CalibrationRequestCreate />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Catatan/i), {
        target: { value: 'Test complaint' }
      });
      fireEvent.click(screen.getByText('Simpan'));
    });

    await waitFor(() => {
      expect(screen.getAllByText('Failed to create calibration request')).toHaveLength(2);
    });

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      const errorTexts = screen.getAllByText('Failed to create calibration request');
      expect(errorTexts).toHaveLength(1);
    });
  });
  
  it('should submit the form successfully', async () => {
    render(<CalibrationRequestCreate />);

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
        `${process.env.NEXT_PUBLIC_API_URL}/request/calibration`,
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

describe('CalibrationRequestCreatePage wrapper', () => {
  it('renders without crashing', () => {
    render(<Page />);
  });
});
