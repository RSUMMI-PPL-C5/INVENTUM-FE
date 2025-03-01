import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserCreatePage from '@/app/dashboard/user/create/page';
import UserCreate from '@/modules/user/user-create';

// Mock the UserCreate component to simplify testing
jest.mock('@/modules/user/user-create', () => {
  return jest.fn(() => <div data-testid="mocked-user-create">UserCreate Component</div>);
});

describe('UserCreatePage', () => {
  it('renders the UserCreate component', () => {
    const { getByTestId } = render(<UserCreatePage />);
    
    // Check that UserCreate was rendered
    expect(getByTestId('mocked-user-create')).toBeInTheDocument();
    
    // Verify the UserCreate component was called
    expect(UserCreate).toHaveBeenCalled();
  });
});