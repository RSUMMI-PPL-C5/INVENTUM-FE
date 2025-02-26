import { render, screen } from '@testing-library/react';
import UserEditPage from '@/app/dashboard/user/[id]/edit/page';

describe('UserDetailsPage', () => {
  it('', () => {
    render(<UserEditPage />);
    const pageName = screen.getByText('UserEdit');
    expect(pageName).toBeInTheDocument();
  });
});