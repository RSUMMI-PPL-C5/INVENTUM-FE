import { render, screen } from '@testing-library/react';

describe('SparePartHistoryCreatePage', () => {
  it('', () => {
    render(<></>);
    const pageName = screen.getByText('SparePartHistoryCreate');
    expect(pageName).toBeInTheDocument();
  });
});
