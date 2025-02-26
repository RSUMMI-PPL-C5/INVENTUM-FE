import { render, screen } from '@testing-library/react';

describe('CalibrationRequestDisplayPage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('CalibrationRequestDisplay');
    expect(pageName).toBeInTheDocument();
  });
});
