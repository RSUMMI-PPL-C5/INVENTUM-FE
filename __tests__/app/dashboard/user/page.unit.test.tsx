import { render, screen } from '@testing-library/react';
import UserDisplayPage from '@/app/dashboard/user/page';

describe('UserDisplayPage', () => {
  it('', () => {
    render(<UserDisplayPage />);
    const pageName = screen.getByText('UserDisplay');
    expect(pageName).toBeInTheDocument();
  });
});