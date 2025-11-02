import React from 'react';
import { Link } from 'react-router-dom';

export const LeftPanel: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-1/2 relative bg-gray-900 text-white flex-col justify-between p-10 rounded-r-3xl overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
        alt="person working"
        className="absolute inset-0 object-cover w-full h-full opacity-40 rounded-r-3xl"
      />

      {/* Top Logo */}
      <div className="relative z-10">
        <Link to="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
          LibAI
        </Link>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-start pl-6">
        <p className="text-2xl font-medium mb-3">
          "Trợ lý ảo thông minh cho thư viện hiện đại."
        </p>
        <p className="text-sm opacity-80">
          Hệ thống LibAI
          <br />
          Quản lý thư viện thông minh
        </p>
      </div>

      {/* Bottom Indicator (Optional) */}
      <div className="relative z-10 opacity-0">
        <div className="h-4"></div>
      </div>
    </div>
  );
};
