import React from 'react';

interface SocialButtonsProps {
  mode?: 'light' | 'dark';
}

export const SocialButtons: React.FC<SocialButtonsProps> = ({ mode = 'light' }) => {
  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="flex items-center my-4">
        <div className={`flex-grow border-t ${
          mode === 'dark' ? 'border-gray-600' : 'border-gray-300'
        }`}></div>
        <span className={`mx-2 text-sm ${
          mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>OR</span>
        <div className={`flex-grow border-t ${
          mode === 'dark' ? 'border-gray-600' : 'border-gray-300'
        }`}></div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        className={`w-full py-2 border rounded-full flex justify-center items-center space-x-2 hover:shadow-md hover:scale-[1.01] transition-all duration-200 ${
          mode === 'dark'
            ? 'border-gray-600 hover:bg-gray-700'
            : 'border-gray-300 hover:bg-gray-100'
        }`}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        <span className={`text-sm font-medium ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>Continue with Google</span>
      </button>
    </div>
  );
};
