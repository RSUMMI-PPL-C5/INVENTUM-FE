import { render, screen } from '@testing-library/react';
import SparePartDetailsPage from '@/app/dashboard/spare-part/[id]/page';

describe('SparePartDetailsPage', () => {
  it('', () => {
    render(<SparePartDetailsPage />);
    const pageName = screen.getByText('SparePartDetails');
    expect(pageName).toBeInTheDocument();
  });
});
