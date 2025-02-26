import { render, screen } from '@testing-library/react';

describe('UserDetailsPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('UserEdit');
    expect(pageName).toBeInTheDocument();
  });
});