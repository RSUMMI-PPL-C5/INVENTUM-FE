import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useParams } from 'next/navigation';
import UserDetailsPage from '@/app/dashboard/user/[id]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock confirm
global.confirm = jest.fn();

describe('UserDetails Component', () => {
  const mockPush = jest.fn();
  
  // Data user sederhana untuk testing
  const mockUser = {
    id: "6df4d1f3-0696-401b-9a00-511401c929c8",
    email: "sigma1@gmail.com",
    username: "amba123",
    role: "user",
    fullname: "sigma2",
    nokar: "EMP123",
    divisiId: 1,
    divisi: { name: "IT Department" },
    waNumber: "6281234567890",
    createdOn: "2025-03-06T11:39:23.951Z",
    modifiedOn: "2025-03-06T11:39:23.951Z"
  };
  
  const falseUser = {
    id: "6df4d1f3-0696-401b-9a00-511401c929c8",
    email: "sigma1@gmail.com",
    username: "amba123",
    role: null, 
    fullname: null, 
    nokar: "EMP123",
    divisiId: null, 
    divisi: null, 
    waNumber: null, 
    createdOn: null, 
    modifiedOn: "2025-03-06T11:39:23.951Z"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router dan params
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: mockUser.id });
    
    // Setup fetch success default
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUser)
    });
    
    // Default confirm adalah true
    (global.confirm as jest.Mock).mockReturnValue(true);
  });
  
  it('should show loading state initially and then display user details', async () => {
    render(<UserDetailsPage />);
    
    // Check loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    
    // Wait for details to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Check basic details are displayed
    expect(screen.getByTestId('user-name')).toHaveTextContent('sigma2');
    expect(screen.getByTestId('user-email')).toHaveTextContent('sigma1@gmail.com');
    expect(screen.getByTestId('user-username')).toHaveTextContent('amba123');
    expect(screen.getByTestId('user-role')).toHaveTextContent('user');
  });
  
  it('should handle errors when user is not found', async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });
    
    render(<UserDetailsPage />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });
  
  it('should handle network errors', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
    
    render(<UserDetailsPage />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });
  
  // it('should handle missing userId', async () => {
  //   // Mock missing ID in params
  //   (useParams as jest.Mock).mockReturnValueOnce({});
    
  //   render(<UserDetailsPage />);
    
  //   // Should show error state since userId is missing
  //   await waitFor(() => {
  //     expect(screen.getByTestId('error-state')).toBeInTheDocument();
  //   });
  // });
  
  it('should navigate back when back button is clicked', async () => {
    render(<UserDetailsPage />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click back button
    fireEvent.click(screen.getByTestId('back-button'));
    
    // Check navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user');
  });
  
  it('should navigate to edit page when edit button is clicked', async () => {
    render(<UserDetailsPage />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByTestId('edit-button'));
    
    // Check navigation
    expect(mockPush).toHaveBeenCalledWith(`/dashboard/user/edit/${mockUser.id}`);
  });

  it('should delete user successfully when confirmed', async () => {
    // Mock successful delete
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options && options.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      
      // Default for GET request
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser)
      });
    });
    
    render(<UserDetailsPage />);
    
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
      expect(mockPush).toHaveBeenCalledWith('/dashboard/user');
    });
  });
  
  it('should not delete when user cancels confirmation', async () => {
    // Mock cancel confirmation
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    
    render(<UserDetailsPage />);
    
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
        json: () => Promise.resolve(mockUser)
      });
    });
    
    render(<UserDetailsPage />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));
    
    // Verify alert was shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Gagal menghapus pengguna');
    });
    
    // Verify no redirect happened
    expect(mockPush).not.toHaveBeenCalledWith('/dashboard/user');
  });

  it('should handle divisi object without name property', async () => {
    // Data user dengan divisi yang ada tetapi tanpa name property
    const userWithEmptyDivisi = {
      ...mockUser,
      divisi: {} // divisi ada tetapi tidak memiliki property name
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(userWithEmptyDivisi)
    });
    
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Verifikasi fallback text untuk divisi tanpa name
    expect(screen.getByTestId('user-divisi')).toHaveTextContent('Tidak ada divisi');
  });

  it('should render all UI elements with correct data', async () => {
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Verifikasi semua elemen UI
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('sigma2');
    expect(screen.getByTestId('user-email')).toHaveTextContent('sigma1@gmail.com');
    expect(screen.getByTestId('user-username')).toHaveTextContent('amba123');
    expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    expect(screen.getByTestId('user-nokar')).toHaveTextContent('EMP123');
    expect(screen.getByTestId('user-divisi')).toHaveTextContent('IT Department');
    expect(screen.getByTestId('user-wa')).toHaveTextContent('6281234567890');
    expect(screen.getByTestId('user-created')).toHaveTextContent('2025-03-06');
    expect(screen.getByTestId('user-modified')).toHaveTextContent('2025-03-06');
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('should render fallbacks for missing data fields', async () => {
    // Data user dengan berbagai field yang null
    const userWithMissingData = {
      ...mockUser,
      fullname: null,
      role: null,
      waNumber: null,
      createdOn: null
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(userWithMissingData)
    });
    
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Verifikasi fallback rendering untuk field yang null
    expect(screen.getByTestId('user-name')).toHaveTextContent('amba123'); // fallback ke username
    expect(screen.getByTestId('user-role')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('user-wa')).toHaveTextContent('Tidak ada');
    expect(screen.getByTestId('user-created')).toHaveTextContent('Tidak ada');
  });

  it('should handle null or undefined API response', async () => {
    // API mengembalikan null
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(null)
    });
    
    render(<UserDetailsPage />);
    
    // Verifikasi error state
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });
});