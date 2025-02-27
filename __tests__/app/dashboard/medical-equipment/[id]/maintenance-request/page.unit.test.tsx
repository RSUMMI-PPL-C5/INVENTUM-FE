import { render, screen } from '@testing-library/react';
import MaintenanceRequestCreatePage from '@/app/dashboard/medical-equipment/[id]/maintenance-request/page';

describe('MaintenanceRequestCreatePage', () => {
  it('', () => {
    render(<MaintenanceRequestCreatePage />);
    const pageName = screen.getByText('MaintenanceRequestCreate');
    expect(pageName).toBeInTheDocument();
  });
});
