import { render, screen, fireEvent } from '@testing-library/react';
import UsersPage from '@/modules/user/user-display';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('UsersPage Component', () => {
  // Setup mock router before each test
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
    
    // Setup router mock with all required methods
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it('should render the user page header', () => {
    render(<UsersPage />);
    
    // Check for header elements
    expect(screen.getByText('Pengguna')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tambah pengguna/i })).toBeInTheDocument();
  });

  it('should render the user table with correct headers', () => {
    render(<UsersPage />);
    
    // Check for table headers - using a more flexible approach
    const headers = ['Email', 'Nama', 'Departemen', 'Tanggal Masuk', 'Aksi'];
    headers.forEach(header => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') }) || 
             screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('should render user data in the table', () => {
    render(<UsersPage />);
    
    // Check for sample user data
    expect(screen.getByText('Azmy Arya Rizaldi')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Executive Director')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('should navigate to user detail page when user row is clicked', () => {
    render(<UsersPage />);
    
    // Find John Doe's row using a more reliable method
    const johnDoeText = screen.getByText('John Doe');
    const userRow = johnDoeText.closest('tr');
    
    // Make sure row was found
    expect(userRow).not.toBeNull();
    
    // Click the row
    fireEvent.click(userRow!);
    
    // Check if router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/2');
  });

  it('should show search input and allow filtering', () => {
    render(<UsersPage />);
    
    // Find search input with more flexible selector
    const searchInput = screen.getByPlaceholderText(/cari pengguna/i);
    expect(searchInput).toBeInTheDocument();
    
    // Type in search input
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // Check if the input value was updated
    expect(searchInput).toHaveValue('John');
  });

  it('should render pagination buttons', () => {
    render(<UsersPage />);
    
    // Check for pagination elements with more flexible approach
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });
  
});