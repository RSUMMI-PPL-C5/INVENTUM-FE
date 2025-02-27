import { render, screen } from '@testing-library/react';
import CalibrationRequestEditPage from '@/app/dashboard/calibration-request/[id]/edit/page';

describe('CalibrationRequestEditPage', () => {
  it('', () => {
    render(<CalibrationRequestEditPage />);
    const pageName = screen.getByText('CalibrationRequestEdit');
    expect(pageName).toBeInTheDocument();
  });
});
