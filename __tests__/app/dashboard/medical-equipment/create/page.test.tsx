import { render, screen } from '@testing-library/react';

describe('MedicalEquipmentCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MedicalEquipmentCreate');
    expect(pageName).toBeInTheDocument();
  });
});
