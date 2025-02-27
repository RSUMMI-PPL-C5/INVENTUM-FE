import { render, screen } from '@testing-library/react';
import CalibrationRequestCreatePage from '@/app/dashboard/medical-equipment/[id]/calibration-request/page';

describe('CalibrationRequestCreatePage', () => {
  it('', () => {
    render(<CalibrationRequestCreatePage />);
    const pageName = screen.getByText('CalibrationRequestCreate');
    expect(pageName).toBeInTheDocument();
  });
});
