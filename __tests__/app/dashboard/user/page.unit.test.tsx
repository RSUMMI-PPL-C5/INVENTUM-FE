import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import UserDisplayPage from '@/app/dashboard/user/page';
import { buildQueryParams } from '@/modules/user/user-display';

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

describe('UserDisplayPage Component', () => {
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

    
  describe('Filter Modal Integration', () => {
    it('should open filter modal when filter button is clicked', () => {
      render(<UserDisplayPage />);
      
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);
      
      expect(screen.getAllByText('Filter')[1]).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Divisi')).toBeInTheDocument();
      expect(screen.getByText('Tanggal dibuat')).toBeInTheDocument();
      expect(screen.getByText('Terakhir diubah')).toBeInTheDocument();
    });
  
    it('should close filter modal when cancel button is clicked', () => {
      render(<UserDisplayPage />);
      
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);
      
      const cancelButton = screen.getByRole('button', { name: /batal/i });
      fireEvent.click(cancelButton);
      
      expect(screen.queryAllByText('Filter')).toHaveLength(1);
    });
  
    it('should close filter modal when OK is clicked', () => {
      render(<UserDisplayPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
      
      const okButton = screen.getByRole('button', { name: /ok/i });
      fireEvent.click(okButton);
      
      expect(screen.queryAllByText('Filter')).toHaveLength(1);
    });
  
    it('should display filter options correctly', () => {
      render(<UserDisplayPage />);
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
      render(<UserDisplayPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
      
      const adminCheckbox = screen.getByLabelText('Admin');
      fireEvent.click(adminCheckbox);
      
      fireEvent.click(screen.getByRole('button', { name: /ok/i }));
      
      fireEvent.click(screen.getByRole('button', { name: /filter/i }));
      
      const adminCheckboxInput = screen.getByLabelText('Admin') as HTMLInputElement;
      expect(adminCheckboxInput).toBeChecked();
    });
  });

describe('buildQueryParams', () => {
  it('should generate query parameters correctly with all filters', () => {
    const filters = {
      role: ['Admin', 'User'],
      division: ['Divisi A', 'Divisi B'],
      createdOnStart: new Date('2024-01-01'),
      createdOnEnd: new Date('2024-01-31'),
      modifiedOnStart: new Date('2024-02-01'),
      modifiedOnEnd: new Date('2024-02-28'),
    };

    const query = buildQueryParams(filters);

    expect(query).toContain('role=Admin');
    expect(query).toContain('role=User');
    expect(query).toContain('divisiId=1');
    expect(query).toContain('divisiId=2');
    expect(query).toContain('createdOnStart=2024-01-01');
    expect(query).toContain('createdOnEnd=2024-01-31');
    expect(query).toContain('modifiedOnStart=2024-02-01');
    expect(query).toContain('modifiedOnEnd=2024-02-28');
  });

  it('should include only provided filters and handle missing dates correctly', () => {
    const filters = {
      role: ['Admin'],
      division: [],
      createdOnStart: new Date('2024-03-01'),
      createdOnEnd: null,
      modifiedOnStart: null,
      modifiedOnEnd: new Date('2024-04-01'),
    };

    const query = buildQueryParams(filters);

    expect(query).toContain('role=Admin');
    expect(query).not.toContain('divisiId=');
    expect(query).toContain('createdOnStart=2024-03-01');
    expect(query).not.toContain('createdOnEnd=');
    expect(query).not.toContain('modifiedOnStart=');
    expect(query).toContain('modifiedOnEnd=2024-04-01');
  });

  it('should return an empty string if no filters are provided', () => {
    const filters = {
      role: [],
      division: [],
      createdOnStart: null,
      createdOnEnd: null,
      modifiedOnStart: null,
      modifiedOnEnd: null,
    };

    const query = buildQueryParams(filters);

    expect(query).toBe('');
  });
});
});