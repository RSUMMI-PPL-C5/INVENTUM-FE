import { render, screen } from '@testing-library/react';
import CalibrationRequestDisplayPage from '@/app/dashboard/calibration-request/page';

describe('CalibrationRequestDisplayPage', () => {
  it('', () => {
    render(<CalibrationRequestDisplayPage />);
    const pageName = screen.getByText('CalibrationRequestDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
