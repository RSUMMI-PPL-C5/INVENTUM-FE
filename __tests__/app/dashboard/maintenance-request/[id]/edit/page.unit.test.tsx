import { render, screen } from '@testing-library/react';
import MaintenanceRequestEditPage from '@/app/dashboard/maintenance-request/[id]/edit/page';

describe('MaintenanceRequestEditPage', () => {
  it('', () => {
    render(<MaintenanceRequestEditPage />);
    const pageName = screen.getByText('MaintenanceRequestEdit');
    expect(pageName).toBeInTheDocument();
  });
});
