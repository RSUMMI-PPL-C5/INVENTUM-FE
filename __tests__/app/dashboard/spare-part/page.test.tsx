import { render, screen } from '@testing-library/react';
import SparePartDisplayPage from '@/app/dashboard/spare-part/page';

describe('SparePartDisplayPage', () => {
  it('', () => {
    render(<SparePartDisplayPage/>);
    const pageName = screen.getByText('SparePartDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
