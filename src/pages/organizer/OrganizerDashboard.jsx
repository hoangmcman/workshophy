import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Tag, Typography, Row, Col, Statistic, Avatar, Space, Divider, Collapse, Button } from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  BankOutlined,
  ShopOutlined,
  TeamOutlined,
  BarChartOutlined,
  RiseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer
} from 'recharts';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import OrganizerHeader from '../../components/organizer/OrganizerHeader';
import ApiService from '../../service/ApiService';
import LoadingScreen from '../utilities/LoadingScreen';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const OrganizerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId: paramUserId } = useParams();
  const userId = paramUserId || localStorage.getItem('userId');
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchBookingDetails();
    }
  }, [userId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBookingsForAdminAndOrganizer({ userId });
      if (response.status === 200 && response.data.success) {
        setBookingData(response.data.data);
      } else {
        console.error("Lỗi API:", response.message);
        setBookingData(null);
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      setBookingData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      0: { color: 'orange', text: 'Chờ xử lý' },
      1: { color: 'green', text: 'Đã thanh toán' },
      2: { color: 'red', text: 'Đã hủy' }
    };
    const config = statusConfig[status] || { color: 'default', text: 'Không xác định' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const bookingColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (orderCode) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Text className="text-blue-600 font-medium text-xs">#</Text>
          </div>
          <Text strong className="text-blue-600">#{orderCode}</Text>
        </div>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity) => (
        <div className="flex justify-center">
          <div className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-blue-600 font-medium">{quantity}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (price) => (
        <div className="text-right">
          <Text strong className="text-green-600 text-lg">
            {formatCurrency(price)}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <div className="flex justify-center">
          {getStatusTag(status)}
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-gray-400" />
          <Text type="secondary">{formatDateTime(date)}</Text>
        </div>
      )
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'purchasedAt',
      key: 'purchasedAt',
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-gray-400" />
          <Text type="secondary">{date ? formatDateTime(date) : 'Chưa thanh toán'}</Text>
        </div>
      )
    }
  ];

  // Prepare data for charts
  const prepareRevenueData = () => {
    if (!bookingData?.workshops) return [];
    const revenueByDate = {};
    bookingData.workshops.forEach(workshop => {
      workshop.bookings.forEach(booking => {
        if (booking.purchasedAt && booking.status === 1) {
          const date = new Date(booking.purchasedAt).toLocaleDateString('vi-VN');
          revenueByDate[date] = (revenueByDate[date] || 0) + (booking.totalPrice || 0);
        }
      });
    });
    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
  };

  const prepareStatusData = () => {
    if (!bookingData?.workshops) return [];
    const statusCounts = { 0: 0, 1: 0, 2: 0 };
    bookingData.workshops.forEach(workshop => {
      workshop.bookings.forEach(booking => {
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
      });
    });
    return [
      { name: 'Chờ xử lý', value: statusCounts[0] },
      { name: 'Đã thanh toán', value: statusCounts[1] },
      { name: 'Đã hủy', value: statusCounts[2] }
    ].filter(item => item.value > 0);
  };

  const prepareWorkshopBookingData = () => {
    if (!bookingData?.workshops) return [];
    return bookingData.workshops.map(workshop => ({
      name: workshop.workshopName.slice(0, 20) + (workshop.workshopName.length > 20 ? '...' : ''),
      bookings: workshop.bookings.length
    }));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!bookingData) {
    return (
      <div className="flex h-screen">
        <OrganizerSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <OrganizerHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChartOutlined className="text-gray-400 text-2xl" />
              </div>
              <Text type="secondary" className="text-lg">Không tìm thấy dữ liệu</Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <OrganizerSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <OrganizerHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={2} className="mb-2 flex items-center text-gray-800">                   
                    Dashboard Nhà tổ chức
                  </Title>
                  <Text type="secondary" className="text-base">
                    Quản lý và theo dõi doanh thu từ các workshop của bạn
                  </Text>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Text type="secondary">Đang cập nhật</Text>
                </div>
              </div>
            </div>

            {/* Enhanced Summary Cards */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <DollarOutlined className="text-white text-xl" />
                    </div>
                    <RiseOutlined className="text-green-500 text-xl" />
                  </div>
                  <Statistic
                    title={<Text className="text-gray-600 font-medium">Tổng Doanh Thu</Text>}
                    value={bookingData.totalAmount}
                    formatter={value => formatCurrency(value)}
                    valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                  />
                  <Divider className="my-3" />
                  <Collapse
                    bordered={false}
                    expandIconPosition="right"
                    className="bg-transparent"
                    style={{ background: 'transparent' }}
                  >
                    <Panel header={<Text type="secondary" style={{ cursor: 'pointer' }}>Xem chi tiết</Text>} key="1" style={{ background: 'transparent' }}>
                      <div className="space-y-1">
                        <Text type="danger" style={{ fontSize: 12 }}>
                          - Phí hoa hồng (3%): {formatCurrency(bookingData.totalAmount * 0.03)}
                        </Text>
                        <br />
                        <Text strong className="text-green-600" style={{ fontSize: 14 }}>
                          Thực nhận: {formatCurrency(bookingData.totalAmount * 0.97)}
                        </Text>
                      </div>
                    </Panel>
                  </Collapse>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <ShopOutlined className="text-white text-xl" />
                    </div>
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                      <Text className="text-blue-600 text-xs font-bold">{bookingData.workshops?.length || 0}</Text>
                    </div>
                  </div>
                  <Statistic
                    title={<Text className="text-gray-600 font-medium">Số Workshop</Text>}
                    value={bookingData.workshops?.length || 0}
                    valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <TeamOutlined className="text-white text-xl" />
                    </div>
                    <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                      <Text className="text-purple-600 text-xs font-bold">
                        {bookingData.workshops?.reduce((total, workshop) => total + workshop.bookings.length, 0) || 0}
                      </Text>
                    </div>
                  </div>
                  <Statistic
                    title={<Text className="text-gray-600 font-medium">Tổng Booking</Text>}
                    value={bookingData.workshops?.reduce((total, workshop) => total + workshop.bookings.length, 0) || 0}
                    valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <BankOutlined className="text-white text-xl" />
                    </div>
                  </div>
                  <div>
                    <Text className="text-gray-600 font-medium block mb-2">Tài Khoản Ngân Hàng</Text>
                    <Text className="text-yellow-600 text-lg font-bold">
                      {bookingData.accountBank || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24}>
                <Card 
                  title={
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <BarChartOutlined className="text-purple-600" />
                      </div>
                      <Text className="text-lg font-semibold">Số Booking Theo Workshop</Text>
                    </div>
                  }
                  className="shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={prepareWorkshopBookingData()} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e8e8e8',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="bookings" fill="#1890ff" name="Số Booking" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Enhanced Detailed Booking Table */}
            <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <TeamOutlined className="text-indigo-600" />
                  </div>
                  <div>
                    <Text className="text-lg font-semibold block">Chi Tiết Booking</Text>
                    <Text type="secondary">Xem thông tin chi tiết từng booking theo workshop</Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setShowTable(!showTable)}
                  icon={showTable ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  {showTable ? 'Ẩn Chi Tiết' : 'Xem Chi Tiết'}
                </Button>
              </div>
              
              {showTable && (
                <div className="mt-6">
                  <Collapse 
                    defaultActiveKey={bookingData.workshops.map((_, index) => index.toString())}
                    className="bg-transparent border-0"
                  >
                    {bookingData.workshops?.map((workshop, index) => (
                      <Panel
                        header={
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                <ShopOutlined className="text-white" />
                              </div>
                              <div>
                                <Title level={5} className="mb-1">{workshop.workshopName}</Title>
                                <Text type="secondary">{workshop.bookings.length} booking(s)</Text>
                              </div>
                            </div>
                            <div className="text-right">
                              <Text className="text-lg font-bold text-green-600">
                                {formatCurrency(workshop.bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0))}
                              </Text>
                            </div>
                          </div>
                        }
                        key={index.toString()}
                        className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <Table
                          dataSource={workshop.bookings}
                          columns={bookingColumns}
                          rowKey="bookingId"
                          pagination={{
                            pageSize: 5,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                              `${range[0]}-${range[1]} của ${total} booking`,
                            className: 'px-4 py-2'
                          }}
                          size="middle"
                          bordered={false}
                          rowClassName={(record, idx) =>
                            idx % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'
                          }
                          className="rounded-lg overflow-hidden"
                        />
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;