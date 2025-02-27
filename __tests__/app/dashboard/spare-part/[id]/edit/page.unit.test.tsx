import { render, screen } from '@testing-library/react';
import SparePartEditPage from '@/app/dashboard/spare-part/[id]/edit/page';

describe('SparePartEditPage', () => {
  it('', () => {
    render(<SparePartEditPage />);
    const pageName = screen.getByText('SparePartEdit');
    expect(pageName).toBeInTheDocument();
  });
});
