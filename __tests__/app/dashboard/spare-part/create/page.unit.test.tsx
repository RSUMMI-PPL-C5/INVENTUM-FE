import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SparePartCreatePage from '@/app/dashboard/spare-part/create/page';
import userEvent from '@testing-library/user-event';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn().mockReturnValue('mock-token'),
}));

// Mock fetch
global.fetch = jest.fn();

// We're NOT mocking SparePartCreatePage or SparePartCreate
// This allows us to test both the wrapper and implementation

describe('SparePartCreatePage Tests', () => {
  // Test the wrapper component first
  it('renders the SparePartCreate component', () => {
    render(<SparePartCreatePage />);
    
    // Check if the implementation component is rendered through the wrapper
    expect(screen.getByText('Tambah Spare Part')).toBeInTheDocument();
  });

  // Now test the implementation component functionality
  describe('SparePartCreate Implementation', () => {
    // Setup common mocks
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };
    
    beforeEach(() => {
      jest.clearAllMocks();
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'new-id' }),
      });
    });

    it('renders the form correctly', () => {
      render(<SparePartCreatePage />);
      
      // Check if the title is rendered
      expect(screen.getByText('Tambah Spare Part')).toBeInTheDocument();
      
      // Check if all form fields are rendered
      expect(screen.getByLabelText(/Nama Spare Part/i)).toBeInTheDocument();
      expect(screen.getByText(/Tanggal Pembelian/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Harga/i)).toBeInTheDocument();
      expect(screen.getByText(/Lokasi Alat/i)).toBeInTheDocument();
      expect(screen.getByText(/Tanggal Alat/i)).toBeInTheDocument();
      
      // Check if buttons are rendered
      expect(screen.getByText('Batalkan')).toBeInTheDocument();
      expect(screen.getByText('Simpan')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(<SparePartCreatePage />);
      
      // Submit the form without filling any fields
      fireEvent.click(screen.getByText('Simpan'));
      
      // Check if validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/Nama spare part wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tanggal pembelian wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/Harga wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/Lokasi alat wajib diisi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tanggal alat wajib diisi/i)).toBeInTheDocument();
      });
    });

    it('submits the form successfully', async () => {
      const user = userEvent.setup();
      render(<SparePartCreatePage />);
      
      // Fill in the form
      await user.type(screen.getByLabelText(/Nama Spare Part/i), 'Test Part');
      await user.type(screen.getByLabelText(/Harga/i), '1000');
      
      // Select purchase date
      const purchaseDateButton = screen.getAllByText(/Pilih tanggal/i)[0];
      await user.click(purchaseDateButton);
      const purchaseDateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])');
      if (purchaseDateCell) {
        await user.click(purchaseDateCell);
      }
      
      // Select tool location
      const locationSelect = screen.getByText(/Pilih Lokasi Alat/i);
      await user.click(locationSelect);
      // Mock location data would be shown here
      
      // Select tool date
      const toolDateButton = screen.getAllByText(/Pilih tanggal/i)[1];
      await user.click(toolDateButton);
      const toolDateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])');
      if (toolDateCell) {
        await user.click(toolDateCell);
      }
      
      // Submit the form
      await user.click(screen.getByText('Simpan'));
      
      // Check if fetch was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `${process.env.NEXT_PUBLIC_API_URL}/spareparts/`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.any(String),
          })
        );
      });
      
      // Check if router.push was called with success URL
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/spare-part');
    });

    it('handles API error during form submission', async () => {
      // Mock fetch to return an error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      const user = userEvent.setup();
      render(<SparePartCreatePage />);
      
      // Fill in the form with minimal required data
      await user.type(screen.getByLabelText(/Nama Spare Part/i), 'Test Part');
      await user.type(screen.getByLabelText(/Harga/i), '1000');
      
      // Select purchase date
      const purchaseDateButton = screen.getAllByText(/Pilih tanggal/i)[0];
      await user.click(purchaseDateButton);
      const purchaseDateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])');
      if (purchaseDateCell) {
        await user.click(purchaseDateCell);
      }
      
      // Select tool date
      const toolDateButton = screen.getAllByText(/Pilih tanggal/i)[1];
      await user.click(toolDateButton);
      const toolDateCell = document.querySelector('[role="gridcell"]:not([aria-disabled="true"])');
      if (toolDateCell) {
        await user.click(toolDateCell);
      }
      
      // Submit the form
      await user.click(screen.getByText('Simpan'));
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Error creating spare part/i)).toBeInTheDocument();
      });
      
      // Check that router.push was not called
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('handles non-OK response from API', async () => {
      // Mock fetch to return a non-OK response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });
      
      render(<SparePartCreatePage />);
      
      // Fill in the form with minimal required data
      fireEvent.change(screen.getByLabelText(/Nama Spare Part/i), { target: { value: 'Test Part' } });
      fireEvent.change(screen.getByLabelText(/Harga/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/Lokasi Alat/i), { target: { value: 'Test Location' } });
      
      // Select dates
      fireEvent.click(screen.getAllByText(/Pilih tanggal/i)[0]);
      const dateButtons = screen.getAllByRole('button', { name: /\d+/ });
      fireEvent.click(dateButtons[15]);
      
      fireEvent.click(screen.getAllByText(/Pilih tanggal/i)[0]);
      fireEvent.click(dateButtons[20]);
      
      // Submit the form
      fireEvent.click(screen.getByText('Simpan'));
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Gagal membuat spare part/i)).toBeInTheDocument();
      });
    });

    it('navigates back when cancel button is clicked', () => {
      render(<SparePartCreatePage />);
      
      // Click the cancel button
      fireEvent.click(screen.getByText('Batalkan'));
      
      // Check if router.back was called
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during form submission', async () => {
      // Delay the fetch response to show loading state
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ id: 'new-id' }),
            });
          }, 100);
        });
      });
      
      render(<SparePartCreatePage />);
      
      // Fill in the form with minimal required data
      fireEvent.change(screen.getByLabelText(/Nama Spare Part/i), { target: { value: 'Test Part' } });
      fireEvent.change(screen.getByLabelText(/Harga/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/Lokasi Alat/i), { target: { value: 'Test Location' } });
      
      // Select dates
      fireEvent.click(screen.getAllByText(/Pilih tanggal/i)[0]);
      const dateButtons = screen.getAllByRole('button', { name: /\d+/ });
      fireEvent.click(dateButtons[15]);
      
      fireEvent.click(screen.getAllByText(/Pilih tanggal/i)[0]);
      fireEvent.click(dateButtons[20]);
      
      // Submit the form
      fireEvent.click(screen.getByText('Simpan'));
      
      // Check if loading state is shown
      expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });
  });
});