import { render, screen } from '@testing-library/react';

describe('SparePartDetailsPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('SparePartDetails');
    expect(pageName).toBeInTheDocument();
  });
});
