import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import ApiService from '../../service/ApiService';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get('status');
    const cancel = query.get('cancel');

    if (status === 'PAID' && cancel !== 'true') {
      message.success('Thanh toán thành công!');

      const savedWorkshop = localStorage.getItem('selectedWorkshop');
      const userEmail = localStorage.getItem('userEmail');

      if (savedWorkshop && userEmail) {
        const workshop = JSON.parse(savedWorkshop);
        const quantity = parseInt(localStorage.getItem('ticketQuantity') || '1');
        const total = workshop.originalPrice * quantity;

        const emailPayload = {
          email: userEmail,
          title: workshop.title,
          date: workshop.date,
          time: workshop.time,
          location: workshop.location,
          quantity,
          total
        };

        ApiService.sendTicketConfirmationEmail(emailPayload)
          .then(() => console.log('Đã gửi email xác nhận vé'))
          .catch((error) => {
            console.error('Lỗi khi gửi email xác nhận:', error);
            message.warning('Không gửi được email xác nhận vé.');
          });
      }

      localStorage.removeItem('selectedWorkshop');
      localStorage.removeItem('ticketQuantity');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else {
      message.error('Thanh toán thất bại hoặc bị hủy.');
      navigate('/payment/failure');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Cảm ơn bạn đã thanh toán!</h1>
      <p className="text-gray-700">Bạn sẽ được chuyển về trang chủ trong giây lát...</p>
    </div>
  );
};

export default PaymentSuccess;
