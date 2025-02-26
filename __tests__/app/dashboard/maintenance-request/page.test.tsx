import { render, screen } from '@testing-library/react';

describe('MaintenanceRequestDisplayPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MaintenanceRequestDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
