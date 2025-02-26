import { render, screen } from '@testing-library/react';
import MaintenanceRequestDisplayPage from '@/app/dashboard/maintenance-request/page';

describe('MaintenanceRequestDisplayPage', () => {
  it('', () => {
    render(<MaintenanceRequestDisplayPage />);
    const pageName = screen.getByText('MaintenanceRequestDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
