import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import UserDisplayPage from '@/app/dashboard/user/page';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock confirm
global.confirm = jest.fn();

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('UsersPage Component', () => {
  const mockPush = jest.fn();
  
  // Mock users data
  const mockUsers = [
    {
      id: '1',
      email: 'user1@example.com',
      username: 'user1',
      role: 'Admin',
      fullname: 'User One',
      nokar: '12345',
      divisiId: 1,
      divisi: { name: 'IT Department' },
      waNumber: '08123456789',
      createdOn: '2023-01-01T00:00:00Z',
      modifiedOn: '2023-01-10T00:00:00Z',
    },
    {
      id: '2',
      email: 'user2@example.com',
      username: 'user2',
      role: 'User',
      fullname: null,
      nokar: '67890',
      divisiId: 2,
      divisi: { name: 'Marketing' },
      waNumber: null,
      createdOn: null,
      modifiedOn: '2023-02-15T00:00:00Z',
    },
    {
      id: '3',
      email: 'user3@example.com',
      username: 'user3',
      role: null,
      fullname: 'User Three',
      nokar: '13579',
      divisiId: null,
      divisi: null, 
      waNumber: '08987654321',
      createdOn: 'invalid-date',
      modifiedOn: '2023-03-20T00:00:00Z',
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Default fetch success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUsers)
    });
  });
  
  it('should handle API error', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<UserDisplayPage />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
    
    // Verify error message
    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });
  
  it('should handle non-ok response', async () => {
    // Mock non-ok response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    
    render(<UserDisplayPage />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
    
    // Verify error message
    expect(screen.getByText(/Failed to fetch users/i)).toBeInTheDocument();
  });
  
  it('should filter users based on search input', async () => {
    render(<UserDisplayPage />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Initially should show all users
    expect(screen.getAllByRole('row').length).toBe(4); // 3 users + header row
    
    // Search for "Admin"
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Admin' }
    });
    
    // Should only show one user with Admin role
    expect(screen.getAllByRole('row').length).toBe(2); // 1 user + header row
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.queryByText('user2@example.com')).not.toBeInTheDocument();
    
    // Search for email
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'user2@example' }
    });
    
    // Should only show user2
    expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    
    // Search for fullname
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Three' }
    });
    
    // Should only show user3
    expect(screen.getByText('user3@example.com')).toBeInTheDocument();
    
    // Search with no results
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'xyz123' }
    });
    
    // Should show no results message
    expect(screen.getByText('No users match your search')).toBeInTheDocument();
    
    // Clear search
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: '' }
    });
    
    // Should show all users again
    expect(screen.getAllByRole('row').length).toBe(4); // 3 users + header row
  });
  
  it('should navigate to user detail when clicking on a row', async () => {
    render(<UserDisplayPage />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Click on first user row
    fireEvent.click(screen.getByTestId('user-row-1'));
    
    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/1');
  });
  
  it('should navigate to user detail when clicking edit button', async () => {
    render(<UserDisplayPage />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Click edit button for first user
    fireEvent.click(screen.getByTestId('edit-button-1'));
    
    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/1');
  });
  
  it('should show confirmation dialog when clicking delete button', async () => {
    // Mock confirm to return true
    (global.confirm as jest.Mock).mockReturnValueOnce(true);
    
    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<UserDisplayPage />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));
    
    // Verify confirmation dialog was shown
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    
    // Verify delete action was logged
    expect(consoleSpy).toHaveBeenCalledWith('Delete user:', '1');
    
    // Restore console.log
    consoleSpy.mockRestore();
  });
  
  it('should not delete user when cancel is clicked in confirmation', async () => {
    // Mock confirm to return false
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    
    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<UserDisplayPage />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));
    
    // Verify console.log was not called
    expect(consoleSpy).not.toHaveBeenCalled();
    
    // Restore console.log
    consoleSpy.mockRestore();
  });
  
  it('should navigate to create user page when add button is clicked', async () => {
    render(<UserDisplayPage />);
    
    // Click add user button
    fireEvent.click(screen.getByText('+ Tambah Pengguna'));
    
    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/create');
  });
  
  it('should handle empty users array', async () => {
    // Mock empty user array
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([])
    });
    
    render(<UserDisplayPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
    });
    
    // Check for empty state message
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });
  
  
  it('should handle invalid date formats', async () => {
    render(<UserDisplayPage />);
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Check that invalid date is displayed as-is
    expect(screen.getByText('invalid-date')).toBeInTheDocument();
  });
});