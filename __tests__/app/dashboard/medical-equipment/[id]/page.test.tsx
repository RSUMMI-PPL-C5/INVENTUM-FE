import { render, screen } from '@testing-library/react';
import MedicalEquipmentDetailsPage from '@/app/dashboard/medical-equipment/[id]/page';

describe('MedicalEquipmentDetailsPage', () => {
  it('', () => {
    render(<MedicalEquipmentDetailsPage />);
    const pageName = screen.getByText('MedicalEquipmentDetails');
    expect(pageName).toBeInTheDocument();
  });
});
