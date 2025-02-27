import { render, screen } from '@testing-library/react';
import CalibrationHistoryCreatePage from '@/app/dashboard/medical-equipment/[id]/calibration/page';

describe('CalibrationHistoryCreatePage', () => {
  it('', () => {
    render(<CalibrationHistoryCreatePage />);
    const pageName = screen.getByText('CalibrationHistoryCreate');
    expect(pageName).toBeInTheDocument();
  });
});
