import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import UserDisplay from '@/app/dashboard/user/page';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock format from date-fns to avoid date parsing issues
jest.mock('date-fns', () => ({
  format: jest.fn().mockImplementation(() => '2023-01-01'),
  isValid: jest.fn().mockReturnValue(true),
}));

// Mock formatDate utility
jest.mock('@/lib/utils', () => ({
  cn: (...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) => {
    const classes = inputs.flat().filter(Boolean).flatMap((cls) => {
      if (typeof cls === 'string') return [cls];
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    });
    return classes.join(' ');
  },
  formatDate: jest.fn().mockImplementation((date) => {
    if (!date) return '-';
    if (date === 'invalid-date') return '-';
    return '01 Jan 2023';
  })
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(() => 'mock-token'),
}));

// Mock DeleteDialog component
jest.mock('@/components/general/delete-dialog', () => ({
  __esModule: true,
  default: ({ 
    open, 
    onOpenChange, 
    onConfirm, 
    title, 
    description,
    isDeleting,
    deleteButtonText,
    cancelButtonText 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onConfirm: () => void; 
    title: string; 
    description: string;
    isDeleting: boolean;
    deleteButtonText: string;
    cancelButtonText: string;
  }) => (
    open ? (
      <div data-testid="delete-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button 
          onClick={onConfirm} 
          data-testid="confirm-delete"
          disabled={isDeleting}
        >
          {isDeleting ? 'Menghapus...' : deleteButtonText}
        </button>
        <button 
          onClick={() => onOpenChange(false)} 
          data-testid="cancel-delete"
          disabled={isDeleting}
        >
          {cancelButtonText}
        </button>
      </div>
    ) : null
  ),
}));

// Type definition for Filters
type MockFilters = {
  role: string[];
  division: string;
  createdOnStart: Date | null;
  createdOnEnd: Date | null;
  modifiedOnStart: Date | null;
  modifiedOnEnd: Date | null;
};

// Mock UserFilterModal component with types
jest.mock('@/components/general/user-filter-modal', () => {
  const actualModule = jest.requireActual('@/components/general/user-filter-modal');
  
  return {
    __esModule: true,
    ...actualModule,
    default: ({ 
      isOpen, 
      filters, 
      onConfirm, 
      onCancel 
    }: { 
      isOpen: boolean; 
      filters: MockFilters; 
      onConfirm: (filters: MockFilters) => void; 
      onCancel: () => void;
    }) => (
      isOpen ? (
        <div data-testid="filter-modal">
          <button onClick={() => onCancel()} data-testid="cancel-filters">
            Batal
          </button>
          <button 
            onClick={() => onConfirm({
              role: ['Admin'],
              division: '1',
              createdOnStart: new Date(),
              createdOnEnd: new Date(),
              modifiedOnStart: new Date(),
              modifiedOnEnd: new Date(),
            })} 
            data-testid="apply-filters"
          >
            OK
          </button>
        </div>
      ) : null
    ),
  };
});

// Mock PaginationControls component
jest.mock('@/components/ui/pagination-control', () => ({
  PaginationControls: ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination-controls">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage <= 1} 
        data-testid="prev-page"
      >
        Previous
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages} 
        data-testid="next-page"
      >
        Next
      </button>
    </div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('UserDisplay Component', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();
  
  const mockSearchParamsGet = jest.fn().mockImplementation((param) => {
    return mockSearchParams.get(param);
  });

  const mockSearchParamsGetAll = jest.fn().mockImplementation((param) => {
    return mockSearchParams.getAll(param);
  });
  
  const mockSearchParamsToString = jest.fn().mockImplementation(() => {
    return mockSearchParams.toString();
  });

  // Mock users data with pagination
  const mockUsersResponse = {
    data: [
      {
        id: '1',
        email: 'user1@example.com',
        username: 'user1',
        role: 'Admin',
        fullname: 'User One',
        nokar: '12345',
        divisiId: 1,
        divisi: { id: '1', divisi: 'IT Department' },
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
        divisi: { id: '2', divisi: 'Marketing' },
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
    ],
    meta: {
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset URLSearchParams mock
    mockSearchParams.delete('page');
    mockSearchParams.delete('search');
    mockSearchParams.delete('role');
    mockSearchParams.delete('divisiId');
    mockSearchParams.delete('createdOnStart');
    mockSearchParams.delete('createdOnEnd');
    mockSearchParams.delete('modifiedOnStart');
    mockSearchParams.delete('modifiedOnEnd');

    // Setup router and search params mocks
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockSearchParamsGet,
      getAll: mockSearchParamsGetAll,
      toString: mockSearchParamsToString,
    });

    // Default fetch success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUsersResponse)
    });
  });

it('renders the users page with title and add button', async () => {
    render(<UserDisplay />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Pengguna' })).toBeInTheDocument();
    expect(screen.getByText('Tambah Pengguna')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Memuat Pengguna...')).not.toBeInTheDocument();
    });
});

  it('should handle API error', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<UserDisplay />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle non-ok response', async () => {
    // Mock non-ok response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Server error' })
    });

    render(<UserDisplay />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should filter users based on search input', async () => {
    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Search for something
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'search term' }
    });

    // Verify URL was updated
    expect(mockPush).toHaveBeenCalledWith(
    expect.stringMatching(/search=search(\+|%20)term/), 
    expect.objectContaining({ scroll: false })
);
  });

  it('should clear search when input is emptied', async () => {
    // Setup with existing search parameter
    mockSearchParams.set('search', 'existing search');
    
    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: '' }
    });

    // Verify URL was updated without search param
    expect(mockPush).toHaveBeenCalledWith(expect.not.stringContaining('search='), 
      expect.objectContaining({ scroll: false }));
  });

  it('should navigate to user detail when clicking on a row', async () => {
    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click on first user row
    fireEvent.click(screen.getByTestId('user-row-1'));

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/1');
  });

  it('should navigate to user edit when clicking edit button', async () => {
    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click edit button for first user
    fireEvent.click(screen.getByTestId('edit-button-1'));

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/1/edit');
  });

  it('should open delete dialog when clicking delete button', async () => {
    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Verify delete dialog is shown
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    expect(screen.getByText('Hapus Pengguna')).toBeInTheDocument();
  });

  it('should delete user when confirming in delete dialog', async () => {
    // Mock successful delete response
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'User deleted' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsersResponse)
      });
    });

    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Click confirm in delete dialog
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => {
      // Verify toast was shown
      expect(toast.info).toHaveBeenCalledWith('Pengguna berhasil dihapus');
    });

    expect(fetch).toHaveBeenNthCalledWith(1, expect.stringContaining('/user'), expect.anything());
    expect(fetch).toHaveBeenNthCalledWith(2, expect.stringContaining('/user/1'), expect.anything());
    expect(fetch).toHaveBeenNthCalledWith(3, expect.stringContaining('/user'), expect.anything());
  });

  it('should handle API error during deletion', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/1')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Error deleting user' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsersResponse)
      });
    });

    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Click confirm in delete dialog
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalled();
    });

    // Verify dialog closed and loading state reset
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });

  it('should handle network error during deletion', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/1')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsersResponse)
      });
    });

    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Click confirm in delete dialog
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalled();
    });

    // Verify dialog closed and loading state reset
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });

  it('should cancel deletion when clicking cancel in delete dialog', async () => {
    render(<UserDisplay />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click delete button for first user
    fireEvent.click(screen.getByTestId('delete-button-1'));

    // Click cancel in delete dialog
    fireEvent.click(screen.getByTestId('cancel-delete'));

    // Verify delete dialog is closed
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    
    // Verify fetch was called only once (initial load)
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should navigate to create user page when add button is clicked', async () => {
    render(<UserDisplay />);

    // Click add user button
    fireEvent.click(screen.getByText('Tambah Pengguna'));

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/dashboard/user/create');
  });

  it('should handle empty users array', async () => {
    // Mock empty user array
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
      })
    });

    render(<UserDisplay />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Memuat Pengguna...')).not.toBeInTheDocument();
    });

    // Check for empty state message
    expect(screen.getByText('Tidak ada pengguna yang ditemukan')).toBeInTheDocument();
  });

  it('should show a different message for empty search results', async () => {
    // Mock empty user array
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
      })
    });

    // Start with search param
    mockSearchParams.set('search', 'nonexistent');

    render(<UserDisplay />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Memuat Pengguna...')).not.toBeInTheDocument();
    });

    // Check for empty search results message
    expect(screen.getByText('Tidak ada pengguna yang cocok dengan pencarian Anda')).toBeInTheDocument();
  });

  it('should open and close filter modal', async () => {
    render(<UserDisplay />);

    // Click filter button
    fireEvent.click(screen.getByText('Filter'));

    // Verify filter modal is open
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByTestId('cancel-filters'));

    // Verify filter modal is closed
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
  });

  it('should apply filters and update URL', async () => {
    render(<UserDisplay />);

    // Click filter button
    fireEvent.click(screen.getByText('Filter'));

    // Click apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));

    // Verify modal closed
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();

    // Verify URL updates with filter params
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('role=Admin'),
      expect.objectContaining({ scroll: false })
    );
    
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('divisiId=1'),
      expect.objectContaining({ scroll: false })
    );
    
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.objectContaining({ scroll: false })
    );
  });

  it('should change page and update URL when using pagination controls', async () => {
    // Mock response with multiple pages
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: mockUsersResponse.data,
        meta: { total: 30, page: 1, limit: 10, totalPages: 3 }
      })
    });

    render(<UserDisplay />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
    });

    // Click next page
    fireEvent.click(screen.getByTestId('next-page'));

    // Verify URL was updated with page=2
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.objectContaining({ scroll: false })
    );
  });

  it('should load users with specified page from URL params', async () => {
    // Set page param
    mockSearchParams.set('page', '2');
    
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Verify the fetch call used the correct page
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.anything()
    );
  });
  
  it('should load users with all specified filter params', async () => {
    // Set multiple filter params
    mockSearchParams.set('search', 'test');
    mockSearchParams.append('role', 'Admin');
    mockSearchParams.append('role', 'User');
    mockSearchParams.set('divisiId', '1');
    mockSearchParams.set('createdOnStart', '2023-01-01');
    mockSearchParams.set('createdOnEnd', '2023-12-31');
    
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Verify fetch included all filter params
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('search=test');
    expect(fetchCall).toContain('role=Admin');
    expect(fetchCall).toContain('role=User');
    expect(fetchCall).toContain('divisiId=1');
  });

  it('should handle full filter flow with all filter types', async () => {
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Open filter modal
    fireEvent.click(screen.getByText('Filter'));
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Verify all date formats were called correctly
    expect(format).toHaveBeenCalledTimes(4);
    
    // Verify URL was updated with all filter params
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('role=Admin'),
      expect.anything()
    );
  });

  it('should include modified date filters in the URL when applied', async () => {
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Open filter modal
    fireEvent.click(screen.getByText('Filter'));
    
    // Apply filters with modified dates
    fireEvent.click(screen.getByTestId('apply-filters'));
    
    // Verify URL was updated with modified date params
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('modifiedOnStart='),
      expect.objectContaining({ scroll: false })
    );
    
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('modifiedOnEnd='),
      expect.objectContaining({ scroll: false })
    );
    
    // Verify format was called for each date (including modified dates)
    expect(format).toHaveBeenCalledTimes(4);
  });

  it('should stop event propagation when clicking cell with actions', async () => {
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Reset the router.push mock to track new calls
    mockPush.mockClear();
    
    // Find the table cell with action buttons (which has stopPropagation)
    const actionCell = screen.getAllByRole('cell').find(
      cell => cell.classList.contains('text-right')
    );
    
    // Simulate click on the cell
    if (actionCell) {
      fireEvent.click(actionCell);
    }
    
    // Verify no navigation occurred (stopPropagation worked)
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should load filters from URL parameters including modified dates', async () => {
    // Set all date-related URL parameters
    mockSearchParams.set('modifiedOnStart', '2023-01-01');
    mockSearchParams.set('modifiedOnEnd', '2023-12-31');
    
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Verify fetch was called with modified date parameters
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('modifiedOnStart=');
    expect(fetchCall).toContain('modifiedOnEnd=');
  });

  it('should render users with null divisi correctly', async () => {
    // Mock response with a user that has null divisi
    const nullDivisiResponse = {
      data: [
        {
          id: '4',
          email: 'user4@example.com',
          username: 'user4',
          role: 'User',
          fullname: 'User Four',
          nokar: '24680',
          divisiId: null,
          divisi: null,
          waNumber: '08123456789',
          createdOn: '2023-01-01T00:00:00Z',
          modifiedOn: '2023-01-10T00:00:00Z',
        }
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(nullDivisiResponse)
    });
    
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Check that the dash is displayed for the divisi
    const divisiCells = screen.getAllByRole('cell');
    expect(divisiCells[2]).toHaveTextContent('-');
  });

  it('should show fallback to username when fullname is null', async () => {
    // Mock response with a user that has null fullname
    const nullFullnameResponse = {
      data: [
        {
          id: '5',
          email: 'user5@example.com',
          username: 'user5',
          role: 'User',
          fullname: null,
          nokar: '13579',
          divisiId: 1,
          divisi: { id: '1', divisi: 'IT Department' },
          waNumber: '08123456789',
          createdOn: '2023-01-01T00:00:00Z',
          modifiedOn: '2023-01-10T00:00:00Z',
        }
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(nullFullnameResponse)
    });
    
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    // Check that the username is displayed instead of fullname
    const nameCells = screen.getAllByRole('cell');
    expect(nameCells[1]).toHaveTextContent('user5');
  });

  it('should not attempt deletion when userToDelete is null', async () => {
    const originalFetch = global.fetch;
    let deleteFetchCalled = false;
    
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'DELETE' && url.includes('/user/')) {
        deleteFetchCalled = true;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsersResponse)
      });
    });
    
    render(<UserDisplay />);
    
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    
    deleteFetchCalled = false;
    
    // Create a scenario where handleDelete might run with null userToDelete
    fireEvent.click(screen.getByTestId('delete-button-1'));
    fireEvent.click(screen.getByTestId('cancel-delete'));
    expect(deleteFetchCalled).toBe(false);
    global.fetch = originalFetch;
  });
});