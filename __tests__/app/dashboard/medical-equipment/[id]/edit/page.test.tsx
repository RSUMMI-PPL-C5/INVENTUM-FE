import { render, screen } from '@testing-library/react';

describe('MedicalEquipmentEditPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MedicalEquipmentEdit');
    expect(pageName).toBeInTheDocument();
  });
});
