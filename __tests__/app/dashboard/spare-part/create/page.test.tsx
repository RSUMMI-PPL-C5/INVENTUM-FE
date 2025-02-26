import { render, screen } from '@testing-library/react';

describe('SparePartCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('SparePartCreate');
    expect(pageName).toBeInTheDocument();
  });
});
