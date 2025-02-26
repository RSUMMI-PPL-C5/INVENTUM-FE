import { render, screen } from '@testing-library/react';

describe('MedicalEquipmentDetailsPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MedicalEquipmentDetails');
    expect(pageName).toBeInTheDocument();
  });
});
