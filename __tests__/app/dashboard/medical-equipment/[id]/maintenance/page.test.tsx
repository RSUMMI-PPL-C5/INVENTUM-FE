import { render, screen } from '@testing-library/react';

describe('MaintenanceHistoryCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('MaintenanceHistoryCreate');
    expect(pageName).toBeInTheDocument();
  });
});
