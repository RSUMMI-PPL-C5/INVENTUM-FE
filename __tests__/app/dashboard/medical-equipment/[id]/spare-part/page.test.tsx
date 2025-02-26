import { render, screen } from '@testing-library/react';
import SparePartHistoryCreatePage from '@/app/dashboard/medical-equipment/[id]/spare-part/page';

describe('SparePartHistoryCreatePage', () => {
  it('', () => {
    render(<SparePartHistoryCreatePage />);
    const pageName = screen.getByText('SparePartHistoryCreate');
    expect(pageName).toBeInTheDocument();
  });
});
