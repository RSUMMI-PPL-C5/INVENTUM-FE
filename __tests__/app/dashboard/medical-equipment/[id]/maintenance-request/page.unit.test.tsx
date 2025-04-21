import { render, screen } from '@testing-library/react';
import MaintenanceRequestCreate from '@/modules/medical-equipment/request/maintenance/maintenance-request-create';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: 'dummy-id' }),
}));

describe('MaintenanceRequestCreatePage', () => {
  let mockBack: jest.Mock;

  beforeEach(() => {
    mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  });

  it('renders the page correctly', () => {
    render(<MaintenanceRequestCreate />);
    
    expect(screen.getByText('Kembali')).toBeInTheDocument();
    expect(screen.getByText('Minta Maintenance')).toBeInTheDocument();
    expect(screen.getByLabelText(/Alat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catatan/i)).toBeInTheDocument();
    expect(screen.getByText('Batalkan')).toBeInTheDocument();
    expect(screen.getByText('Simpan')).toBeInTheDocument();
  });

  it('should go back when the kembali button is clicked', () => {
    render(<MaintenanceRequestCreate />);
    
    const backButton = screen.getByText('Kembali');
    backButton.click();
    
    expect(mockBack).toHaveBeenCalled();
  });

  it('should go back when the batalkan button is clicked', () => {
    render(<MaintenanceRequestCreate />);
    
    const cancelButton = screen.getByText('Batalkan');
    cancelButton.click();
    
    expect(mockBack).toHaveBeenCalled();
  });
});
