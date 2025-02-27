import UserCreatePage from '@/app/dashboard/user/create/page';
import { render, screen } from '@testing-library/react';

describe('UserCreatePage', () => {
  it('', () => {
    render(<UserCreatePage/>);
    const pageName = screen.getByText('UserCreate');
    expect(pageName).toBeInTheDocument();
  });
});