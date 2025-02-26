import { render, screen } from '@testing-library/react';
import MedicalEquipmentEditPage from '@/app/dashboard/medical-equipment/[id]/edit/page';

describe('MedicalEquipmentEditPage', () => {
  it('', () => {
    render(<MedicalEquipmentEditPage />);
    const pageName = screen.getByText('MedicalEquipmentEdit');
    expect(pageName).toBeInTheDocument();
  });
});
