import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  mode?: 'light' | 'dark';
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  mode = 'light',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${
        mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-2 pr-10 border rounded-lg transition-all duration-200 ${
            mode === 'dark'
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400'
          } focus:outline-none`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute inset-y-0 right-3 flex items-center transition-colors ${
            mode === 'dark' 
              ? 'text-gray-400 hover:text-gray-200' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
