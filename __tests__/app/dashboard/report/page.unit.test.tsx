import { render, screen } from '@testing-library/react';
import ReportDisplayPage from '@/app/dashboard/report/page';

describe('ReportDisplayPage', () => {
  it('', () => {
    render(<ReportDisplayPage />);
    const pageName = screen.getByText('ReportDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
