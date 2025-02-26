import { render, screen } from '@testing-library/react';

describe('SparePartDisplayPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('SparePartDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
