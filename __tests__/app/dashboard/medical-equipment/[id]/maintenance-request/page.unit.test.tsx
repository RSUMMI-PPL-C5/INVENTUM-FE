import { render, screen } from '@testing-library/react';
import MaintenanceRequestCreate from '@/modules/medical-equipment/request/maintenance/maintenance-request-create';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: 'dummy-id' }),
}));

describe('MaintenanceRequestCreatePage', () => {
  it('renders the page correctly', () => {
    render(<MaintenanceRequestCreate />);
    
    expect(screen.getByText('Kembali')).toBeInTheDocument();
    expect(screen.getByText('Minta Maintenance')).toBeInTheDocument();
    expect(screen.getByLabelText(/Alat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catatan/i)).toBeInTheDocument();
    expect(screen.getByText('Batalkan')).toBeInTheDocument();
    expect(screen.getByText('Simpan')).toBeInTheDocument();
  });
});
