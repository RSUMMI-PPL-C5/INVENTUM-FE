import { render, screen } from '@testing-library/react';

describe('MaintenanceRequestCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MaintenanceRequestCreate');
    expect(pageName).toBeInTheDocument();
  });
});
