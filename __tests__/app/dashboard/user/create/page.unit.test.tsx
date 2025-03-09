import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserCreate from '../../../../../src/modules/user/user-create';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock window functions
global.alert = jest.fn();
global.confirm = jest.fn();
global.fetch = jest.fn();
global.console.error = jest.fn();
global.console.log = jest.fn();

describe('UserCreate Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default behavior for confirm
    (global.confirm as jest.Mock).mockImplementation(() => true);
  });

  // Test component rendering
  it('renders the component correctly', () => {
    render(<UserCreate />);
    
    // Check if important elements are rendered
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  // Test validation errors for empty fields
  it('displays validation errors when submitting empty form', async () => {
    render(<UserCreate />);
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByText('Create User'));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Role is required')).toBeInTheDocument();
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Employee number is required')).toBeInTheDocument();
      expect(screen.getByText('Division is required')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp number is required')).toBeInTheDocument();
      expect(screen.getByText('Date of entry is required')).toBeInTheDocument();
    });
  });

  // Replace the entire email validation test with this simpler version
  it('prevents form submission with invalid email', async () => {
    const mockCreateUserApi = jest.fn().mockResolvedValue({ success: true });
    render(<UserCreate createUserApi={mockCreateUserApi} />);
    
    // Fill in all fields but with invalid email
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } }); // Invalid email
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628123456789' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // API should NOT be called with invalid email
    await waitFor(() => {
      expect(mockCreateUserApi).not.toHaveBeenCalled();
    });
    
    // Fix the email and try again
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'valid@example.com' } });
    
    // Submit again
    fireEvent.click(screen.getByText('Create User'));
    
    // API should be called now with valid data
    await waitFor(() => {
      expect(mockCreateUserApi).toHaveBeenCalled();
    });
  });

  // Test WhatsApp number validation
  it('validates WhatsApp number format', async () => {
    render(<UserCreate />);
    
    // Fill in an invalid WhatsApp number
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '08123456789' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check if WhatsApp validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('WhatsApp number must start with 628')).toBeInTheDocument();
    });
    
    // Correct the WhatsApp number and verify error is cleared
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '6281234567890' } });
    
    await waitFor(() => {
      expect(screen.queryByText('WhatsApp number must start with 628')).not.toBeInTheDocument();
    });
  });

  // Test form cancellation with empty form
  it('resets form when cancel is clicked with empty form', () => {
    render(<UserCreate />);
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Confirm dialog should not be shown for empty form
    expect(global.confirm).not.toHaveBeenCalled();
  });

  // Test form cancellation with filled form
  it('shows confirmation dialog when cancel is clicked with filled form', () => {
    render(<UserCreate />);
    
    // Fill in a field
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Confirm dialog should be shown
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to cancel? All entered data will be lost.');
  });

  // Test successful form submission
  it('submits form successfully with complete data', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'testuser' }),
      status: 200,
    });
    
    const mockCreateUserApi = jest.fn().mockResolvedValue({ success: true });
    render(<UserCreate createUserApi={mockCreateUserApi} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628123456789' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(mockCreateUserApi).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        fullname: 'Test User',
        nokar: 'EMP123',
        divisiId: '1',
        waNumber: '628123456789',
        entryDate: '2023-01-01',
        createdBy: 1
      });
    });
    
    // Check if alert and navigation happened
    expect(global.alert).toHaveBeenCalledWith('User created successfully');
  });

  // Test form submission with admin role
  it('submits form successfully with admin role', async () => {
    const mockCreateUserApi = jest.fn().mockResolvedValue({ success: true });
    render(<UserCreate createUserApi={mockCreateUserApi} />);
    
    // Fill in all required fields with admin role
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'adminuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Admin User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'ADM456' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628987654321' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-02-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(mockCreateUserApi).toHaveBeenCalledWith({
        username: 'adminuser',
        email: 'admin@example.com',
        role: 'admin',
        fullname: 'Admin User',
        nokar: 'ADM456',
        divisiId: '2',
        waNumber: '628987654321',
        entryDate: '2023-02-01',
        createdBy: 1
      });
    });
  });

  // Test form submission failure
  it('handles API errors when form submission fails', async () => {
    // Mock API failure
    const mockCreateUserApi = jest.fn().mockRejectedValue(new Error('API error'));
    render(<UserCreate createUserApi={mockCreateUserApi} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628123456789' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check if error handling works
    await waitFor(() => {
      expect(global.console.error).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Failed to create user. Please try again.');
    });
  });

  // Test the default createUserApi implementation
  it('uses default createUserApi implementation when not provided', async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, username: 'testuser' }),
      status: 200,
    });
    
    render(<UserCreate />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628123456789' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check if fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // Test what happens when user cancels the confirmation dialog
  it('does not reset form when user cancels the confirmation dialog', () => {
    // Mock user cancelling the confirmation dialog
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    
    render(<UserCreate />);
    
    // Fill in a field
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Confirm dialog should be shown
    expect(global.confirm).toHaveBeenCalled();
    
    // Check that the field still has its value (not reset)
    expect(screen.getByLabelText(/Username/i)).toHaveValue('testuser');
  });

  // Test API error handling with default implementation
  it('handles API errors with default implementation', async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<UserCreate />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628123456789' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check error handling
    await waitFor(() => {
      expect(global.console.error).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Failed to create user. Please try again.');
    });
  });
  
  // Test API response with non-OK status
  it('handles API response with non-OK status', async () => {
    // Mock fetch response with error status
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'Validation error' })
    });
    
    render(<UserCreate />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Employee Number/i), { target: { value: 'EMP123' } });
    fireEvent.change(screen.getByLabelText(/Division/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/WhatsApp Number/i), { target: { value: '628123456789' } });
    fireEvent.change(screen.getByLabelText(/Date of Entry/i), { target: { value: '2023-01-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create User'));
    
    // Check error handling
    await waitFor(() => {
      expect(global.console.error).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Failed to create user. Please try again.');
    });
  });
});