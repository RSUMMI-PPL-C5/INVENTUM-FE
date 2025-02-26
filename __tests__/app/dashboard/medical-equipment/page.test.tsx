import { render, screen } from '@testing-library/react';

describe('MedicalEquipmentDisplayPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MedicalEquipmentDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
