import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserCreate from '@/modules/user/user-create';
import * as nextNavigation from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('UserCreate Component', () => {
  // Setup mocks before each test
  let mockRouter: { push: jest.Mock; back: jest.Mock; refresh: jest.Mock };
  let mockConfirm: jest.SpyInstance;
  let mockAlert: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup router mock
    mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      refresh: jest.fn(),
    };
    (nextNavigation.useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Setup window.confirm mock
    mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);
    
    // Setup window.alert mock
    mockAlert = jest.spyOn(window, 'alert');
    mockAlert.mockImplementation(() => {});
    
    // Setup console.error mock
    mockConsoleError = jest.spyOn(console, 'error');
    mockConsoleError.mockImplementation(() => {});

    // Use fake timers by default
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  
  // Basic rendering test
  it('renders the form correctly', () => {
    render(<UserCreate />);
    
    // Check that all form elements are rendered
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Division/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Entry/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });
  
  // Form input tests
  it('updates form data when inputs change', () => {
    render(<UserCreate />);
    
    // Get input elements
    const usernameInput = screen.getByLabelText(/Username/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const roleInput = screen.getByLabelText(/Role/i) as HTMLSelectElement;
    const fullnameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
    const nokarInput = screen.getByLabelText(/Employee Number/i) as HTMLInputElement;
    const divisiIdInput = screen.getByLabelText(/Division/i) as HTMLSelectElement;
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i) as HTMLInputElement;
    const entryDateInput = screen.getByLabelText(/Date of Entry/i) as HTMLInputElement;
    
    // Change input values
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Check that input values were updated
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(roleInput.value).toBe('user');
    expect(fullnameInput.value).toBe('Test User');
    expect(nokarInput.value).toBe('EMP123');
    expect(divisiIdInput.value).toBe('1');
    expect(waNumberInput.value).toBe('628123456789');
    expect(entryDateInput.value).toBe('2023-01-01');
  });
  
  // Validation tests
  it('shows validation errors when form is invalid', async () => {
    render(<UserCreate />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Role is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Employee number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Division is required/i)).toBeInTheDocument();
      expect(screen.getByText(/WhatsApp number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Date of entry is required/i)).toBeInTheDocument();
    });
  });
  
  it('validates email format', async () => {
    render(<UserCreate />);
    
    // Fill in form with valid data except for the email
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'invalid@domain' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that email validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Email is invalid/i)).toBeInTheDocument();
    });
  });

  it('validates WhatsApp number format', async () => {
    render(<UserCreate />);
    
    // Fill in form with valid data except for WhatsApp number
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '081234567890' } }); // Invalid, should start with 628
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that WhatsApp number validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/WhatsApp number must start with 628/i)).toBeInTheDocument();
    });
  });
  
  it('validates empty email as invalid', async () => {
    render(<UserCreate />);
    
    // Fill in form with valid data except for the email
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that email validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });
  
  it('clears error messages when fields with errors are edited', async () => {
    render(<UserCreate />);
    
    // Submit empty form to trigger errors
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    });
    
    // Now edit a field with an error
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Check that the error for this field is cleared
    expect(screen.queryByText(/Username is required/i)).not.toBeInTheDocument();
    
    // Other errors should remain
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });
  
  // Form submission tests
  it('submits the form successfully', async () => {
    render(<UserCreate />);
    
    // Fill in form with valid data
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check for loading state
    expect(screen.getByText(/Creating.../i)).toBeInTheDocument();
    
    // Fast-forward timers
    jest.runAllTimers();
    
    // Check that form submission was handled correctly
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('User created successfully');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/user');
    });
  });
  
  it('handles API error during form submission', async () => {
    // Mock API function that throws an error
    const mockCreateUserApi = jest.fn().mockImplementation(() => {
      throw new Error('API Error');
    });
    
    // Render with our mock API
    render(<UserCreate createUserApi={mockCreateUserApi} />);
    
    // Fill in form with valid data
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that error handling worked correctly
    expect(mockConsoleError).toHaveBeenCalledWith('Error creating user:', expect.any(Error));
    expect(mockAlert).toHaveBeenCalledWith('Failed to create user. Please try again.');
    
    // Verify loading state is reset after error
    expect(screen.getByRole('button', { name: /Create User/i })).toBeInTheDocument();
    expect(screen.queryByText(/Creating.../i)).not.toBeInTheDocument();
    
    // Verify the submit button is enabled again
    const addUserButton = screen.getByRole('button', { name: /Create User/i });
    expect(addUserButton).not.toBeDisabled();
  });
  
  // Cancel button tests
  it('does nothing when cancel is clicked with empty form', () => {
    render(<UserCreate />);
    
    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Expect no confirm dialog
    expect(mockConfirm).not.toHaveBeenCalled();
  });
  
  it('shows confirmation dialog when cancel is clicked with filled form and user confirms', () => {
    render(<UserCreate />);
    
    // Fill in form with data
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Click cancel and confirm
    mockConfirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Expect confirm dialog
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to cancel? All entered data will be lost.');
    
    // Form should be reset (empty)
    expect(usernameInput).toHaveValue('');
  });
  
  it('does not reset form when cancel is clicked with filled form but user cancels', () => {
    render(<UserCreate />);
    
    // Fill in form with data
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Click cancel but don't confirm
    mockConfirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Expect confirm dialog
    expect(mockConfirm).toHaveBeenCalled();
    
    // Form should not be reset
    expect(usernameInput).toHaveValue('testuser');
  });
  
  // Loading state test
  it('shows loading state during form submission', async () => {
    // Create a mock implementation that doesn't run the callback immediately
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = jest.fn() as any;
    
    render(<UserCreate />);
    
    // Fill in form with valid data
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that loading state is shown
    expect(screen.getByText(/Creating.../i)).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /Creating.../i });
    expect(submitButton).toBeDisabled();
    
    // Restore original setTimeout
    window.setTimeout = originalSetTimeout;
  });
  
  it('handles form with some empty fields', async () => {
    render(<UserCreate />);
    
    // Fill in only some fields
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that validation errors are shown for empty fields only
    expect(screen.getByText(/Role is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Employee number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Division is required/i)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Date of entry is required/i)).toBeInTheDocument();
    
    // These fields should not show errors
    expect(screen.queryByText(/Username is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
  });
  
  it('handles whitespace in required fields', async () => {
    render(<UserCreate />);
    
    // Fill in fields with whitespace
    const usernameInput = screen.getByLabelText(/Username/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    
    fireEvent.change(usernameInput, { target: { value: '   ' } });
    fireEvent.change(fullnameInput, { target: { value: '   ' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check that validation treats whitespace as empty
    expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
  });
  
  it('handles null or undefined email in validation', () => {
    // This test directly tests the validateEmail function behavior
    // by setting up situations that would make it process a null/undefined email
    const { rerender } = render(<UserCreate />);
    
    // First submit a valid form
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Then clear the email field to force the empty validation path
    fireEvent.change(emailInput, { target: { value: '' } });
    
    // Submit the form to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Check validation error
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });
  
  it('properly resets the form', () => {
    render(<UserCreate />);
    
    // Fill in all form fields
    const usernameInput = screen.getByLabelText(/Username/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const roleInput = screen.getByLabelText(/Role/i) as HTMLSelectElement;
    const fullnameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
    const nokarInput = screen.getByLabelText(/Employee Number/i) as HTMLInputElement;
    const divisiIdInput = screen.getByLabelText(/Division/i) as HTMLSelectElement;
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i) as HTMLInputElement;
    const entryDateInput = screen.getByLabelText(/Date of Entry/i) as HTMLInputElement;
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Generate errors
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Then reset via cancel button (with confirm mocked to true)
    mockConfirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // All fields should be reset
    expect(usernameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(roleInput.value).toBe('');
    expect(fullnameInput.value).toBe('');
    expect(nokarInput.value).toBe('');
    expect(divisiIdInput.value).toBe('');
    expect(waNumberInput.value).toBe('');
    expect(entryDateInput.value).toBe('');
  });
  
  it('validates empty email correctly', async () => {
    render(<UserCreate />);
    
    // Fill everything except email
    const usernameInput = screen.getByLabelText(/Username/i);
    const roleInput = screen.getByLabelText(/Role/i);
    const fullnameInput = screen.getByLabelText(/Full Name/i);
    const nokarInput = screen.getByLabelText(/Employee Number/i);
    const divisiIdInput = screen.getByLabelText(/Division/i);
    const waNumberInput = screen.getByLabelText(/WhatsApp Number/i);
    const entryDateInput = screen.getByLabelText(/Date of Entry/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(roleInput, { target: { value: 'user' } });
    fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
    fireEvent.change(nokarInput, { target: { value: 'EMP123' } });
    fireEvent.change(divisiIdInput, { target: { value: '1' } });
    fireEvent.change(waNumberInput, { target: { value: '628123456789' } });
    fireEvent.change(entryDateInput, { target: { value: '2023-01-01' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
    
    // Email required error should be shown
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });
});