import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Tag, Typography, Row, Col, Statistic, Avatar, Space, Divider } from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  BankOutlined,
  ShopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import OrganizerHeader from '../../components/organizer/OrganizerHeader';
import ApiService from '../../service/ApiService';
import LoadingScreen from '../utilities/LoadingScreen';

const { Title, Text } = Typography;

const Income = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId: paramUserId } = useParams();
  const userId = paramUserId || localStorage.getItem('userId');

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
        <Text strong className="text-blue-600">#{orderCode}</Text>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity) => (
        <Tag color="blue">{quantity}</Tag>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (price) => (
        <Text strong className="text-green-600">
          {formatCurrency(price)}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Text type="secondary">{formatDateTime(date)}</Text>
      )
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'purchasedAt',
      key: 'purchasedAt',
      render: (date) => (
        <Text type="secondary">{date ? formatDateTime(date) : 'Chưa thanh toán'}</Text>
      )
    }
  ];

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
            <Text type="secondary">Không tìm thấy dữ liệu</Text>
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
            {/* Header thông tin tài khoản */}
            <Card className="mb-6 shadow-sm">
              <Row gutter={24} align="middle">
                <Col span={6}>
                  <div className="text-center">
                    <Avatar size={80} icon={<UserOutlined />} className="bg-blue-500 mb-3" />
                    <Title level={4} className="mb-0">{bookingData.ownerName}</Title>
                    <Text type="secondary">Người tổ chức</Text>
                  </div>
                </Col>
                <Col span={18}>
                  <Row gutter={24}>
                    <Col span={8}>
                      <Statistic
                        title="Tổng doanh thu"
                        value={bookingData.totalAmount}
                        formatter={value => formatCurrency(value)}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<DollarOutlined />}
                      />
                      <div style={{ marginTop: 4 }}>
                        <Text type="danger" style={{ fontSize: 12 }}>
                          - Phí hoa hồng (3%): {formatCurrency(bookingData.totalAmount * 0.03)}
                        </Text>
                        <br />
                        <Text strong style={{ fontSize: 13 }}>
                          Thực nhận: {formatCurrency(bookingData.totalAmount * 0.97)}
                        </Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Số workshop"
                        value={bookingData.workshops?.length || 0}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<ShopOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Tổng booking"
                        value={bookingData.workshops?.reduce((total, workshop) => total + workshop.bookings.length, 0) || 0}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                  </Row>

                  {bookingData.accountBank && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <Space>
                        <BankOutlined className="text-gray-500" />
                        <Text strong>Số tài khoản:</Text>
                        <Text copyable>{bookingData.accountBank}</Text>
                      </Space>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Danh sách workshop cards */}
            <div className="space-y-6 mt-4">
              {bookingData.workshops?.map((workshop, index) => (
                <Card
                  key={workshop.workshopId}
                  className={`shadow-sm hover:shadow-md transition-shadow duration-200${index === 0 ? ' mt-6' : ''}`}
                  title={
                    <div className="flex items-center justify-between mx-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                          <Title level={4} className="mb-1">{workshop.workshopName}</Title>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            {formatCurrency(bookingData.totalAmount)}
                          </Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Tổng doanh thu</Text>
                          </div>
                          <Text type="danger" style={{ fontSize: 12 }}>
                            - Phí hoa hồng (3%): {formatCurrency(bookingData.totalAmount * 0.03)}
                          </Text>
                          <br />
                          <span style={{ fontSize: 22, color: '#52c41a', fontWeight: 700 }}>
                            Thực nhận: {formatCurrency(bookingData.totalAmount * 0.97)}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                  extra={
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {workshop.bookings.length}
                        </div>
                        <Text type="secondary" className="text-xs">Booking</Text>
                      </div>
                      <Tag color="blue" className="px-3 py-1">
                        Workshop #{index + 1}
                      </Tag>
                    </div>
                  }
                >
                  {workshop.bookings.length > 0 ? (
                    <Table
                      dataSource={workshop.bookings}
                      columns={bookingColumns}
                      rowKey="bookingId"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} của ${total} booking`
                      }}
                      className="mt-4"
                      size="middle"
                      bordered={false}
                      rowClassName={(record, index) =>
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <TeamOutlined style={{ fontSize: '48px' }} />
                      </div>
                      <Text type="secondary">Chưa có booking nào cho workshop này</Text>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {bookingData.workshops?.length === 0 && (
              <Card className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ShopOutlined style={{ fontSize: '64px' }} />
                </div>
                <Title level={4} type="secondary">Chưa có workshop nào</Title>
                <Text type="secondary">Người tổ chức này chưa có workshop nào được tạo.</Text>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Income;