import { render, screen } from '@testing-library/react';
import MedicalEquipmentCreatePage from '@/app/dashboard/medical-equipment/create/page';

describe('MedicalEquipmentCreatePage', () => {
  it('', () => {
    render(<MedicalEquipmentCreatePage />);
    const pageName = screen.getByText('MedicalEquipmentCreate');
    expect(pageName).toBeInTheDocument();
  });
});
