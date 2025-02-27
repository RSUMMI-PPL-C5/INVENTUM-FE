import { render, screen } from '@testing-library/react';
import UserDetailsPage from '@/app/dashboard/user/[id]/page';

describe('UserDetailsPage', () => {
  it('', () => {
    render(<UserDetailsPage />);
    const pageName = screen.getByText('UserDetails');
    expect(pageName).toBeInTheDocument();
  });
});