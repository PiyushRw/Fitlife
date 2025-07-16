import React from 'react';
import { Listbox } from '@headlessui/react';
import { Fragment } from 'react';

const CustomDropdown = ({ label, options, value, onChange, placeholder, className = '' }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold mb-1">{label}</label>}
      <Listbox value={value} onChange={onChange} as={Fragment}>
        <div className="relative">
          <Listbox.Button
            className={`w-full px-2 py-1 bg-[#121212] text-white border border-gray-700 rounded text-sm flex justify-between items-center focus:outline-none focus:border-[#62E0A1] focus:ring-2 focus:ring-[#62E0A1]/20 hover:border-[#62E0A1] transition-all ${className}`}
            style={{ minHeight: '38px', fontSize: '1rem', fontWeight: 400 }}
          >
            <span>{value || placeholder}</span>
            <span className="text-gray-400">⌄</span>
          </Listbox.Button>
          <Listbox.Options
            className="absolute top-full left-0 right-0 border border-gray-700 rounded mt-1 max-h-48 overflow-y-auto z-50 shadow-xl bg-[#121212] text-white"
            style={{ fontSize: '1rem', fontWeight: 400 }}
          >
            {options.map((opt) => (
              <Listbox.Option
                key={opt}
                value={opt}
                className={({ active, selected }) =>
                  `px-2 py-1 cursor-pointer rounded text-sm flex items-center min-h-[38px] ${
                    active ? 'bg-[#2a2a2a]' : ''
                  } ${selected ? 'font-semibold text-[#62E0A1]' : ''}`
                }
                as={Fragment}
              >
                {({ selected }) => (
                  <li className="w-full">
                    {opt}
                    {selected && <span className="float-right">✔</span>}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default CustomDropdown; 