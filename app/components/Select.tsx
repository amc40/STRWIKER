import React from 'react';

type Id = number | string;

export interface SelectOption<Id> {
  id: Id;
  label: string | number;
}

interface SelectProps<Id> {
  options: SelectOption<Id>[];
  selectedId?: Id;
  onChange: (id: Id) => void;
  loading?: boolean;
}

export const Select = <T extends Id>({
  options,
  selectedId,
  onChange,
  loading = false,
}: SelectProps<T>) => {
  console.log('loading', loading);
  return (
    <select
      value={selectedId}
      className="block w-full px-4 py-2 mt-2 border border-gray-300 bg-white rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
      onChange={(e) => {
        onChange(e.target.value as T);
      }}
      disabled={loading}
    >
      {loading ? (
        <option>Loading...</option>
      ) : (
        options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))
      )}
    </select>
  );
};
