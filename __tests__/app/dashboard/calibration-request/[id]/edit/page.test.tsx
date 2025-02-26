import { render, screen } from '@testing-library/react';

describe('CalibrationRequestEditPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('CalibrationRequestEdit');
    expect(pageName).toBeInTheDocument();
  });
});
