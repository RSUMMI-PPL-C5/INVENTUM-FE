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
  
  describe('Filter Modal Integration', () => {
    it('should open filter modal when filter button is clicked', () => {
      render(<UsersPage />);
      
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);
      
      expect(screen.getAllByText('Filter')[1]).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Divisi')).toBeInTheDocument();
      expect(screen.getByText('Tanggal dibuat')).toBeInTheDocument();
      expect(screen.getByText('Terakhir diubah')).toBeInTheDocument();
    });
  
    it('should close filter modal when cancel button is clicked', () => {
      render(<UsersPage />);
      
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);
      
      const cancelButton = screen.getByRole('button', { name: /batal/i });
      fireEvent.click(cancelButton);
      
      expect(screen.queryAllByText('Filter')).toHaveLength(1);
    });
  
    it('should close filter modal when OK is clicked', () => {
      render(<UsersPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
      
      const okButton = screen.getByRole('button', { name: /ok/i });
      fireEvent.click(okButton);
      
      expect(screen.queryAllByText('Filter')).toHaveLength(1);
    });
  
    it('should display filter options correctly', () => {
      render(<UsersPage />);
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
  
      ['User', 'Asesor', 'Admin'].forEach(role => {
        expect(screen.getByText(role)).toBeInTheDocument();
      });
  
      ['Divisi A', 'Divisi B', 'Divisi C'].forEach(div => {
        expect(screen.getByText(div)).toBeInTheDocument();
      });

      expect(screen.getAllByPlaceholderText(/tanggal mulai/i)).toHaveLength(2);
      expect(screen.getAllByPlaceholderText(/tanggal akhir/i)).toHaveLength(2);
    });
  
    it('should persist filter selections when reapplying', async () => {
      render(<UsersPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
      
      const adminCheckbox = screen.getByLabelText('Admin');
      fireEvent.click(adminCheckbox);
      
      fireEvent.click(screen.getByRole('button', { name: /ok/i }));
      
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
      
      const adminCheckboxInput = screen.getByLabelText('Admin') as HTMLInputElement;
      expect(adminCheckboxInput).toBeChecked();
    });
  });
});