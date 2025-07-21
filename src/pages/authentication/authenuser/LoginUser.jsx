import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../../service/ApiService';
import Swal from 'sweetalert2';

const LoginUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Login attempt with:', formData);
      const response = await ApiService.loginUser(formData);
      console.log('API Response:', response);

      if (response.status === 200 && response.data && response.data.accessToken) {
        const userInfoResponse = await ApiService.getLoggedInUserInfo();
        if (userInfoResponse.status === 200 && userInfoResponse.data) {
          const roleId = userInfoResponse.data.role;
          const roleName = ApiService.mapRoleIdToName(roleId);
          localStorage.setItem('userRole', roleName);
          localStorage.setItem('userId', userInfoResponse.data.id);

          await Swal.fire({
            title: 'Thành công',
            text: 'Đăng nhập thành công, xin vui lòng chờ trong giây lát',
            icon: 'success'
          });

          switch (roleName) {
            case 'ADMIN':
              navigate('/admindashboard');
              break;
            case 'ORGANIZER':
              navigate('/organizerdashboard');
              break;
            case 'USER':
              navigate('/');
              break;
            default:
              navigate('/');
          }
        } else {
          throw new Error('Không thể lấy thông tin người dùng sau khi đăng nhập');
        }

        const role = userInfoResponse?.data?.role || "USER";
        switch (role) {
          case 'ADMIN':
            navigate('/admindashboard');
            break;
          case 'ORGANIZER':
            navigate('/organizerdashboard');
            break;
          case 'USER':
            navigate('/');
            break;
          default:
            navigate('/');
        }
      } else {
        Swal.fire('Error', response.message || 'Đăng nhập không thành công', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire('Error', error.message || 'Không thể đăng nhập được, xin vui lòng thử lại', 'error');
    }
  };

  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const clientId = '1098549759457-50jvav67ctpd88frui4bqh6qhged86kh.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const scope = encodeURIComponent('openid email profile');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfeU49APx-oCOoGEw3u3P3M5ccF4jpufV82pwgMcsfPfsl4jaK54zeU-G0UjxTBGaWMi5rOcQ1NozXp5wZz2fyH_D3oO8lpras5n3mUjLMrQzmtJYw75buWGIFcB2czx93OsVq5hZecHE/s1600/work-shop-la-gi.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden bg-opacity-90">
          <div className="px-8 pt-8 pb-4">
            <h1 className="text-3xl font-bold text-gray-800 text-center">Đăng Nhập</h1>
            <p className="text-center text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
          </div>

          <div className="px-8 py-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-600 font-medium mb-2">Địa Chỉ Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-colors duration-300"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex mb-2">
                  <label className="text-gray-600 font-medium">Mật Khẩu</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-colors duration-300"
                    placeholder="Nhập mật khẩu của bạn"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-white font-bold rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#0A1338' }}
              >
                Đăng Nhập
              </button>
            </form>
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="/signupuser" className="text-blue-900 font-semibold hover:underline">
                  Đăng Ký Ngay
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;