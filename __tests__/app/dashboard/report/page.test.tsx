import { render, screen } from '@testing-library/react';

describe('ReportDisplayPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('ReportDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
