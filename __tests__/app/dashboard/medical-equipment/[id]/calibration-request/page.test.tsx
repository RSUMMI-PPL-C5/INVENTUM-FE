import { render, screen } from '@testing-library/react';

describe('CalibrationRequestCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('CalibrationRequestCreate');
    expect(pageName).toBeInTheDocument();
  });
});
