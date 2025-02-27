import { render, screen } from '@testing-library/react';
import MedicalEquipmentDisplayPage from '@/app/dashboard/medical-equipment/page';

describe('MedicalEquipmentDisplayPage', () => {
  it('', () => {
    render(<MedicalEquipmentDisplayPage />);
    const pageName = screen.getByText('MedicalEquipmentDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
