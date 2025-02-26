import { render, screen } from '@testing-library/react';

describe('UserDisplayPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('UserDisplay');
    expect(pageName).toBeInTheDocument();
  });
});