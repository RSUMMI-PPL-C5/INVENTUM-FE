import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import UserFilterModal from '@/components/general/userfiltermodal';

describe('UserFilterModal', () => {
  const mockFilters = {
    role: [],
    division: [],
    createdOnStart: null,
    createdOnEnd: null,
    modifiedOnStart: null,
    modifiedOnEnd: null,
  };

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    render(
      <UserFilterModal isOpen={true} filters={mockFilters} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );
  });

  it('renders header and filter options texts correctly', () => {
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Asesor')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Divisi')).toBeInTheDocument();
    expect(screen.getByText('Divisi A')).toBeInTheDocument();
    expect(screen.getByText('Divisi B')).toBeInTheDocument();
    expect(screen.getByText('Divisi C')).toBeInTheDocument();
    expect(screen.getByText('Tanggal dibuat')).toBeInTheDocument();
    expect(screen.getByText('Terakhir diubah')).toBeInTheDocument();
  });

  it('renders cancel and confirm buttons', () => {
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('allows selecting multiple roles', () => {
    const userCheckbox = screen.getByLabelText('User');
    const adminCheckbox = screen.getByLabelText('Admin');

    fireEvent.click(userCheckbox);
    fireEvent.click(adminCheckbox);

    expect(userCheckbox).toBeChecked();
    expect(adminCheckbox).toBeChecked();
  });

  it('allows selecting multiple divisions', () => {    
    const divA = screen.getByLabelText('Divisi A');
    const divB = screen.getByLabelText('Divisi B');

    fireEvent.click(divA);
    fireEvent.click(divB);

    expect(divA).toBeChecked();
    expect(divB).toBeChecked();
  });

  it('allows selecting a date range', () => {
    const datePickerStart = screen.getAllByPlaceholderText("Tanggal Mulai")[0];
    fireEvent.click(datePickerStart);

    const startDate = screen.getAllByText("1")[0];
    fireEvent.click(startDate);

    const datePickerEnd = screen.getAllByPlaceholderText("Tanggal Akhir")[0];
    fireEvent.click(datePickerEnd);

    const EndDate = screen.getAllByText("2")[0];
    fireEvent.click(EndDate);

    expect(datePickerStart).toHaveValue("2025-03-01");
    expect(datePickerEnd).toHaveValue("2025-03-02");
  });

  it('hides modal when cancel button is clicked', () => {
    
    fireEvent.click(screen.getByText('Batal'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('updates filter state when confirm button is clicked', () => {
    fireEvent.click(screen.getByText('OK'));

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});