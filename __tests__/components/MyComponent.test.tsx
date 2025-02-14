import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  test('renders the component with the given name', () => {
    render(<MyComponent name="John" />);
    expect(screen.getByText('Hello, John!')).toBeInTheDocument();
  });

  test('renders default text when no name is provided', () => {
    render(<MyComponent name="Guest" />);
    expect(screen.getByText('Hello, Guest!')).toBeInTheDocument();
  });
});