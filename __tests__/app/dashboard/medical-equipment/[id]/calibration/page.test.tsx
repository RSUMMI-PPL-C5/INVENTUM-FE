import { render, screen } from '@testing-library/react';

describe('CalibrationHistoryCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('CalibrationHistoryCreate');
    expect(pageName).toBeInTheDocument();
  });
});
