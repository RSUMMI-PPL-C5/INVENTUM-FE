import { render, screen } from '@testing-library/react';
import UserCreate from '@/modules/user/user-create';

describe('UserCreatePage', () => {
  it('', () => {
    render(<UserCreate></UserCreate>);
    const pageName = screen.getByText('UserCreate');
    expect(pageName).toBeInTheDocument();
  });
});