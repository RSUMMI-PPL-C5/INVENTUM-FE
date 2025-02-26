import { render, screen } from '@testing-library/react';

describe('SparePartEditPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('SparePartEdit');
    expect(pageName).toBeInTheDocument();
  });
});
