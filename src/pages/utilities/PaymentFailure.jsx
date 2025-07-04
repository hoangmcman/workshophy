import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Thanh toán thất bại hoặc bị hủy!</h1>
      <p className="text-gray-700">Bạn sẽ được chuyển về trang chủ trong giây lát...</p>
    </div>
  );
};

export default PaymentFailure;
