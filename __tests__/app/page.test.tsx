import { render, screen } from '@testing-library/react';

describe('LoginModulePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('LoginModule');
    expect(pageName).toBeInTheDocument();
  });
});