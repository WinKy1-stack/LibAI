import React from 'react';

interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  mode?: 'light' | 'dark';
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  mode = 'light',
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${
        mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full mt-1 px-4 py-2 border rounded-lg transition-all duration-200 ${
          mode === 'dark'
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-500'
            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400'
        } focus:outline-none ${className}`}
      />
    </div>
  );
};
