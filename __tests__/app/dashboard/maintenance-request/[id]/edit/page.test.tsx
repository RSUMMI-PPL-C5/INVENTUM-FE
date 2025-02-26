import { render, screen } from '@testing-library/react';

describe('MaintenanceRequestEditPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MaintenanceRequestEdit');
    expect(pageName).toBeInTheDocument();
  });
});
