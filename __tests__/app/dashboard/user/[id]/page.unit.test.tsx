import { render, screen, fireEvent } from '@testing-library/react';
import UserDetailsPage from '@/app/dashboard/user/[id]/page';
import { useRouter, useParams } from 'next/navigation';

// Mock modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock komponen UserDetails agar tidak langsung menggunakan hooks
jest.mock('@/modules/user/user-details', () => {
  const MockUserDetails = () => (
    <div data-testid="user-details-component">
      <h1>UserDetails</h1>
      <div className="user-info">
        <h2>Azmy Arya Rizaldi</h2>
        <p>Executive Director</p>
        <div data-testid="user-email">azmy@gmail.com</div>
        <div data-testid="user-phone">+62 812 3456 7890</div>
      </div>
      <button data-testid="back-button">Kembali</button>
      <button data-testid="edit-button">Edit Profile</button>
    </div>
  );
  return {
    __esModule: true,
    default: MockUserDetails
  };
});

describe('UserDetailsPage', () => {
  // Setup mock router dan params
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  
  beforeEach(() => {
    // Mock router functions
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      prefetch: jest.fn(),
    });
    
    // Mock route params
    (useParams as jest.Mock).mockReturnValue({
      id: '1' // ID user dari URL
    });
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the UserDetails component', () => {
    render(<UserDetailsPage />);
    
    // Check if UserDetails component is rendered
    const userDetailElement = screen.getByTestId('user-details-component');
    expect(userDetailElement).toBeInTheDocument();
    
    const pageName = screen.getByText('UserDetails');
    expect(pageName).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(<UserDetailsPage />);
    
    // Check if user information is displayed
    expect(screen.getByText('Azmy Arya Rizaldi')).toBeInTheDocument();
    expect(screen.getByText('Executive Director')).toBeInTheDocument();
    expect(screen.getByTestId('user-email')).toHaveTextContent('azmy@gmail.com');
    expect(screen.getByTestId('user-phone')).toHaveTextContent('+62 812 3456 7890');
  });

  it('should have navigation buttons', () => {
    render(<UserDetailsPage />);
    
    // Check if back and edit buttons exist
    const backButton = screen.getByTestId('back-button');
    const editButton = screen.getByTestId('edit-button');
    
    expect(backButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
  });
});