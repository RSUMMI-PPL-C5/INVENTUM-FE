import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/page';

describe('LoginModulePage', () => {
  it('', () => {
    render(<LoginPage />);
    const pageName = screen.getByText('LoginModule');
    expect(pageName).toBeInTheDocument();
  });
});