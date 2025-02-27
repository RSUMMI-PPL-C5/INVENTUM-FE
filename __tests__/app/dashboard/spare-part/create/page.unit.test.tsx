import { render, screen } from '@testing-library/react';
import SparePartCreatePage from '@/app/dashboard/spare-part/create/page';

describe('SparePartCreatePage', () => {
  it('', () => {
    render(<SparePartCreatePage />);
    const pageName = screen.getByText('SparePartCreate');
    expect(pageName).toBeInTheDocument();
  });
});
