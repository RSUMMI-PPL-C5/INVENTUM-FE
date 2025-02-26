import { render, screen } from '@testing-library/react';

describe('UserCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('UserCreate');
    expect(pageName).toBeInTheDocument();
  });
});