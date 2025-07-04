import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#091238] rounded-full animate-spin mx-auto"></div>
          {/* Gradient overlay spinner */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin mx-auto opacity-50" style={{animationDelay: '0.1s'}}></div>
        </div>
        
        {/* Loading text */}
        <h2 className="text-2xl font-bold text-[#091238] mb-2">Đang tải dữ liệu lên...</h2>
        <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        
        {/* Dots animation */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-[#091238] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#091238] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-[#091238] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;