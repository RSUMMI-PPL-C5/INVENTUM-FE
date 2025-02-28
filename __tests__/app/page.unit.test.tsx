import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginModule from '@/app/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginModule', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Positive Cases
  it('renders the login page correctly', () => {
    render(<LoginModule />);

    const logo = screen.getByAltText('Logo RS UMMI');
    expect(logo).toBeInTheDocument();

    const title = screen.getByText('INVENTUM');
    expect(title).toBeInTheDocument();

    const subtitle = screen.getByText('Inventaris Terpadu RS UMMI');
    expect(subtitle).toBeInTheDocument();

    const usernameInput = screen.getByPlaceholderText('azmy.arya.rizaldi');
    expect(usernameInput).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText('******');
    expect(passwordInput).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: /masuk/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<LoginModule />);

    const passwordInput = screen.getByPlaceholderText('******');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits the form and navigates to the dashboard', async () => {
    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText('azmy.arya.rizaldi');
    const passwordInput = screen.getByPlaceholderText('******');
    const loginButton = screen.getByRole('button', { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/medical-equipment');
    });
  });

  // Negative Cases
  it('does not navigate if username is empty', async () => {
    render(<LoginModule />);

    const passwordInput = screen.getByPlaceholderText('******');
    const loginButton = screen.getByRole('button', { name: /masuk/i });

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('does not navigate if password is empty', async () => {
    render(<LoginModule />);

    const usernameInput = screen.getByPlaceholderText('azmy.arya.rizaldi');
    const loginButton = screen.getByRole('button', { name: /masuk/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('does not navigate if both username and password are empty', async () => {
    render(<LoginModule />);

    const loginButton = screen.getByRole('button', { name: /masuk/i });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('does not toggle password visibility if toggle button is not clicked', () => {
    render(<LoginModule />);

    const passwordInput = screen.getByPlaceholderText('******');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('does not render invalid elements', () => {
    render(<LoginModule />);

    const invalidElement = screen.queryByText('Invalid Element');
    expect(invalidElement).not.toBeInTheDocument();
  });
});