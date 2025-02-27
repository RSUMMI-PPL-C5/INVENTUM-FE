import { render, screen } from '@testing-library/react';
import MaintenanceHistoryCreatePage from '@/app/dashboard/medical-equipment/[id]/maintenance/page';

describe('MaintenanceHistoryCreatePage', () => {
  it('', () => {
    render(<MaintenanceHistoryCreatePage />);
    const pageName = screen.getByText('MaintenanceHistoryCreate');
    expect(pageName).toBeInTheDocument();
  });
});
