import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../../service/ApiService';
import Swal from 'sweetalert2';

const SignupUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    isOrganizer: false,
    accountNumber: '',
  });
  

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Mật khẩu không khớp', 'error');
      return;
    }

    try {
      const registrationData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        userRole: formData.isOrganizer ? 2 : 3,
        status: 1,
        accountNumber: formData.isOrganizer ? formData.accountNumber : undefined,
      };

      console.log('Signup attempt with:', registrationData);
      const response = await ApiService.registerUser(registrationData);

      if (response.status === 200) {
        // ✅ Đăng nhập ngay sau đăng ký để lấy token mới
        const loginResponse = await ApiService.loginUser({
          email: formData.email,
          password: formData.password,
        });

        if (loginResponse.status === 200 && loginResponse.data.accessToken) {
          localStorage.setItem('token', loginResponse.data.accessToken);

          // ✅ Gọi lại userInfo với token mới
          const userInfoResponse = await ApiService.getLoggedInUserInfo();
          if (userInfoResponse.status === 200 && userInfoResponse.data) {
            const roleId = userInfoResponse.data.role;
            const roleName = ApiService.mapRoleIdToName(roleId);
            localStorage.setItem('userRole', roleName);
            localStorage.setItem('userId', userInfoResponse.data.id);
          }

          await Swal.fire(
            'Thành công',
            'Bạn đã đăng ký thành công! Xin hãy dành vài giây để khảo sát sở thích của bạn.',
            'success'
          );

          if (!formData.isOrganizer) {
            navigate('/questions');
          } else {
            navigate('/loginuser');
          }
        } else {
          throw new Error('Tự động đăng nhập sau đăng ký thất bại');
        }
      } else {
        Swal.fire('Lỗi', response.message, 'error');
      }
    } catch (error) {
      console.error('Lỗi đăng ký tài khoản:', error);
      Swal.fire('Lỗi', error.message || 'Không thể đăng ký người dùng mới được', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfeU49APx-oCOoGEw3u3P3M5ccF4jpufV82pwgMcsfPfsl4jaK54zeU-G0UjxTBGaWMi5rOcQ1NozXp5wZz2fyH_D3oO8lpras5n3mUjLMrQzmtJYw75buWGIFcB2czx93OsVq5hZecHE/s1600/work-shop-la-gi.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden bg-opacity-90">
          <div className="px-8 pt-8 pb-4">
            <h1 className="text-3xl font-bold text-gray-800 text-center">Tạo Tài Khoản</h1>
            <p className="text-center text-gray-600 mt-2">Tham gia cộng đồng của chúng tôi ngay hôm nay</p>
          </div>

          <div className="px-8 py-6 max-h-[75vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Họ</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Nhập họ của bạn" required />
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Tên</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Nhập tên của bạn" required />
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Địa Chỉ Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Nhập email của bạn" required />
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Số Điện Thoại</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Nhập số điện thoại của bạn" required />
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Mật Khẩu</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Tạo mật khẩu" required />
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải dài ít nhất 8 ký tự</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Xác Nhận Mật Khẩu</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Xác nhận mật khẩu của bạn" required />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input type="checkbox" name="isOrganizer" checked={formData.isOrganizer} onChange={handleChange} className="mr-2 h-5 w-5" />
                  <span className="text-gray-600 font-medium">Bạn muốn trở thành Organizer?</span>
                </label>
              </div>

              {formData.isOrganizer && (
                <div className="mb-6">
                  <label className="block text-gray-600 font-medium mb-2">Số Tài Khoản</label>
                  <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Nhập số tài khoản của bạn" required />
                </div>
              )}

              <button type="submit" className="w-full py-3 px-4 text-white font-bold rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105" style={{ backgroundColor: '#0A1338' }}>
                Tạo Tài Khoản
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <a href="/loginuser" className="text-blue-900 font-semibold hover:underline">
                  Đăng Nhập
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupUser;