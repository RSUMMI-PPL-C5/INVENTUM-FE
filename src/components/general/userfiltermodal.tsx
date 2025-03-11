"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface Filters {
  role: string[];
  division: string[];
  createdOnStart: Date | null;
  createdOnEnd: Date | null;
  modifiedOnStart: Date | null;
  modifiedOnEnd: Date | null;
}

interface ModalProps {
  isOpen: boolean;
  filters: Filters;
  onConfirm: (filters: Filters) => void;
  onCancel: () => void;
}

const UserFilterModal: React.FC<ModalProps> = ({ isOpen, filters, onConfirm, onCancel }) => {
  const roleOptions = ["User", "Asesor", "Admin"];
  const divisionOptions = ["Divisi A", "Divisi B", "Divisi C"];

  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleCheckboxChange = (type: "role" | "division", value: string) => {
    setLocalFilters((prev) => {
      const currentValues = prev[type];
      return {
        ...prev,
        [type]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleDateChange = (type: "createdOnStart" | "createdOnEnd" | "modifiedOnStart" | "modifiedOnEnd", date: Date | null) => {
    setLocalFilters((prev) => {
      const updatedFilters = { ...prev };
  
      if (date) {
        updatedFilters[type] = date;
        if (type === "createdOnStart" && prev.createdOnEnd && date > prev.createdOnEnd) {
          updatedFilters.createdOnEnd = date;
        }
        if (type === "modifiedOnStart" && prev.modifiedOnEnd && date > prev.modifiedOnEnd) {
          updatedFilters.modifiedOnEnd = date;
        }
      } else {
        updatedFilters[type] = null;
      }
  
      return updatedFilters;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-5/6 sm:w-3/4 md:w-5/12">
        <div className="modal-header mb-4 rounded-lg">
          <h2 className="text-2xl font-semibold">Filter</h2>
        </div>

        <div className="modal-content grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-2 sm:block sm:border-r border-gray-300">
            {/* Role Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Role</h3>
              {roleOptions.map((role) => (
                <label key={role} className="block">
                  <input
                    type="checkbox"
                    className="accent-black mr-2"
                    checked={localFilters.role.includes(role)}
                    onChange={() => handleCheckboxChange("role", role)}
                  />
                  {role}
                </label>
              ))}
            </div>

            {/* Division Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Divisi</h3>
              {divisionOptions.map((div) => (
                <label key={div} className="block">
                  <input
                    type="checkbox"
                    className="accent-black mr-2"
                    checked={localFilters.division.includes(div)}
                    onChange={() => handleCheckboxChange("division", div)}
                  />
                  {div}
                </label>
              ))}
            </div>
          </div>

          <div>
            {/* CreatedOn Date Pickers */}
            <div className="mb-6 sm:mb-4">
              <h3 className="font-semibold mb-2">Tanggal dibuat</h3>
              <div className="grid grid-cols-1 gap-y-1">
                <DatePicker
                  selected={localFilters.createdOnStart}
                  onChange={(date) => handleDateChange("createdOnStart", date)}
                  className="border p-2 w-full rounded"
                  maxDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Tanggal Mulai"
                />
                <DatePicker
                  selected={localFilters.createdOnEnd}
                  onChange={(date) => handleDateChange("createdOnEnd", date)}
                  className="border p-2 w-full rounded"
                  minDate={localFilters.createdOnStart || undefined}
                  maxDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Tanggal Akhir"
                />
              </div>
            </div>

            {/* modifiedOn Date Pickers */}
            <div className="mb-6 sm:mb-4">
              <h3 className="font-semibold mb-2">Terakhir diubah</h3>
              <div className="grid grid-cols-1 gap-y-1">
                <DatePicker
                  selected={localFilters.modifiedOnStart}
                  onChange={(date) => handleDateChange("modifiedOnStart", date)}
                  className="border p-2 w-full rounded"
                  maxDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Tanggal Mulai"
                />
                <DatePicker
                  selected={localFilters.modifiedOnEnd}
                  onChange={(date) => handleDateChange("modifiedOnEnd", date)}
                  className="border p-2 w-full rounded"
                  minDate={localFilters.modifiedOnStart || undefined}
                  maxDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  placeholderText="Tanggal Akhir"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="modal-footer flex justify-end md:justify-around lg:justify-end space-x-2 mt-4">
          <Button className="px-4 py-2 w-full sm:w-24" variant="destructive" size="lg" onClick={onCancel}>
            Batal
          </Button>
          <Button className="px-4 py-2 w-full sm:w-24" size="lg" onClick={() => onConfirm(localFilters)}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserFilterModal;
