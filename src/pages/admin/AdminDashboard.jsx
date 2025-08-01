import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Card, Row, Col, Table, Statistic, Button, Typography, Divider, Collapse, Tag, message, Spin } from 'antd';
import { Bar } from 'react-chartjs-2';
import { UserOutlined, BookOutlined, DollarOutlined, StarOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons';
import ApiService from '../../service/ApiService';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx'; // Thêm thư viện xuất Excel

// Register all Chart.js components
Chart.register(...registerables);

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [organizers, setOrganizers] = useState([]);
  const [workshopMap, setWorkshopMap] = useState({});
  const [panelLoading, setPanelLoading] = useState({});
  const barChartRef = useRef(null);
  const [organizerTableData, setOrganizerTableData] = useState([]);
  const [bookingMap, setBookingMap] = useState({});
  const [workshops, setWorkshops] = useState([]);
  const [searchWorkshop, setSearchWorkshop] = useState('');
  const [workshopPage, setWorkshopPage] = useState(1);
  const [totalWorkshops, setTotalWorkshops] = useState(0);
  const workshopPageSize = 5;

  useEffect(() => {
    const fetchAdminAnalytics = async () => {
      setLoading(true);
      try {
        const response = await ApiService.getAdminAnalytics();
        if (response.status === 200 && response.data) {
          setStatsData([
            { title: 'Tổng Người Dùng', value: response.data.data.totalUser || 0, icon: <UserOutlined />, color: '#1890ff' },
            {
              title: 'Người Dùng Hoạt Động',
              value: response.data.data.totalActiveUser || 0,
              icon: <TeamOutlined />,
              color: '#52c41a'
            },
          ]);
          setTotalRevenue(response.data.data.revenueByMonth || 0); // Updated to use revenueByMonth
          setWorkshops(response.data.data.workshops || []);
        }
      } catch (error) {
        message.error('Failed to fetch admin analytics');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrganizersWithWorkshops = async () => {
      setLoading(true);
      const res = await ApiService.getAllUsers({ role: 2 });
      if (res.status === 200 && res.data && res.data.data?.items) {
        const items = res.data.data.items; // <--- Sửa ở đây
        const filtered = items.filter(user => user.role === 2);
        const formatted = filtered.map(user => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || 'No Email',
          accountBank: user.accountBank || 'Chưa có',
          status: user.status === 1 ? 'active' : 'inactive'
        }));
        setOrganizers(items); // dùng cho phân tích
        setOrganizerTableData(formatted); // bảng hiển thị
      }
      setLoading(false);
    };

    fetchAdminAnalytics();
    fetchOrganizersWithWorkshops();

    // Cleanup charts on unmount
    return () => {
      if (barChartRef.current) barChartRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    fetchWorkshops();
  }, [workshopPage]);

  const fetchWorkshops = async () => {
    try {
      const res = await ApiService.getAllWorkshops({
        page: workshopPage,
        pageSize: workshopPageSize,
      });
      if (res.status === 200) {
        const items = res.data.data.items || [];
        const total = res.data.data.count || 0;

        const formatted = items.map(item => ({
          id: item.workshopId,
          title: item.title,
          price: item.price,
          location: item.location,
          createdAt: item.createdAt,
          organizer: `${item.userInfo.firstName} ${item.userInfo.lastName}`,
          email: item.userInfo.email,
          status: item.status,
        }));

        setWorkshops(formatted);
        setTotalWorkshops(total);
      }
    } catch (error) {
      message.error("Không thể tải danh sách workshop");
      console.error(error);
    }
  };

  const fetchBookingsByOrganizer = async (organizerId) => {
    if (bookingMap[organizerId]) return; // tránh gọi lại nếu đã có

    try {
      const res = await ApiService.getBookingsForAdminAndOrganizer({ userId: organizerId });
      if (res.status === 200 && res.data.success) {
        setBookingMap(prev => ({ ...prev, [organizerId]: res.data.data }));
      } else {
        message.error('Không thể tải dữ liệu booking');
        setBookingMap(prev => ({ ...prev, [organizerId]: null }));
      }
    } catch (err) {
      message.error('Lỗi hệ thống khi gọi booking');
      setBookingMap(prev => ({ ...prev, organizerId: null }));
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Xuất Excel
  const exportToExcel = () => {
    if (!workshops.length) {
      message.warning('Không có dữ liệu để xuất!');
      return;
    }
    const data = workshops.map(w => ({
      'Tên Workshop': w.name,
      'Giảng viên': w.instructor,
      'Danh mục': w.category,
      'Học viên': w.students,
      'Đánh giá': w.rating,
      'Doanh thu': w.revenue,
      'Trạng thái': w.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Workshops');
    XLSX.writeFile(wb, 'workshops_report.xlsx');
  };

  const workshopColumns = [
    {
      title: 'Tên Workshop',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Người tổ chức',
      dataIndex: 'organizer',
      key: 'organizer',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Giá vé',
      dataIndex: 'price',
      key: 'price',
      render: price => (
        <span className="text-green-600 font-semibold">
          {price?.toLocaleString('vi-VN')}₫
        </span>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const map = {
          0: { label: 'Nháp', color: 'default' },
          1: { label: 'Đã duyệt', color: 'success' },
          2: { label: 'Từ chối', color: 'error' },
        };
        const info = map[status] || { label: 'Không xác định', color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleDateString('vi-VN'),
    }
  ];

  // Hàm lấy dữ liệu doanh thu và số workshop theo từng tháng từ bookingMap
  const getMonthlyRevenueData = () => {
    // Khởi tạo mảng 12 tháng
    const monthlyRevenue = Array(12).fill(0);
    const monthlyWorkshopCount = Array(12).fill(0);

    Object.values(bookingMap).forEach((organizerData) => {
      organizerData?.workshops?.forEach(ws => {
        // Giả sử ws.bookings là mảng các booking, mỗi booking có purchasedAt (ngày thanh toán) và totalPrice
        if (ws.bookings && ws.bookings.length > 0) {
          // Đếm workshop vào tháng đầu tiên có booking đã thanh toán
          const paidBookings = ws.bookings.filter(bk => bk.purchasedAt);
          if (paidBookings.length > 0) {
            // Lấy tháng của booking đầu tiên đã thanh toán
            const firstPaid = paidBookings[0];
            const month = new Date(firstPaid.purchasedAt).getMonth(); // 0-11
            monthlyWorkshopCount[month]++;
          }
          // Cộng doanh thu từng booking vào đúng tháng
          ws.bookings.forEach(bk => {
            if (bk.purchasedAt) {
              const month = new Date(bk.purchasedAt).getMonth(); // 0-11
              monthlyRevenue[month] += bk.totalPrice || 0;
            }
          });
        }
      });
    });

    return { monthlyRevenue, monthlyWorkshopCount };
  };

  const { monthlyRevenue, monthlyWorkshopCount } = getMonthlyRevenueData();

  const revenueData = {
    labels: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    datasets: [
      {
        label: 'Doanh thu',
        backgroundColor: '#52c41a',
        data: monthlyRevenue,
      },
      {
        label: 'Số Workshop',
        backgroundColor: '#1890ff',
        data: monthlyWorkshopCount,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  // Hàm tính tổng doanh thu/thực nhận toàn bộ organizer
  const getTotalRevenueAndNet = () => {
    let total = 0;
    let net = 0;
    organizers.forEach(org => {
      org.workshops?.forEach(ws => {
        total += ws.revenue || 0;
        net += ws.revenue ? ws.revenue * 0.97 : 0;
      });
    });
    return { total, net };
  };

  const { total, net } = getTotalRevenueAndNet();

  // Khi mở panel, lấy danh sách workshop của organizer đó
  const handlePanelChange = async (activeKeys) => {
    if (!activeKeys || !activeKeys.length) return;
    const organizerId = activeKeys[activeKeys.length - 1];
    if (workshopMap[organizerId]) return; // Đã có dữ liệu rồi

    setPanelLoading(prev => ({ ...prev, [organizerId]: true }));
    // Gọi API lấy workshop cho organizer này
    const res = await ApiService.getBookingsForAdminAndOrganizer({ organizerId });
    if (res.status === 200 && res.data && Array.isArray(res.data.data)) {
      setWorkshopMap(prev => ({ ...prev, [organizerId]: res.data.data[0]?.workshops || [] }));
    } else {
      setWorkshopMap(prev => ({ ...prev, [organizerId]: [] }));
    }
    setPanelLoading(prev => ({ ...prev, [organizerId]: false }));
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

  const getStatusTag = (status) => {
    const statusConfig = {
      0: { color: 'orange', text: 'Chờ xử lý' },
      1: { color: 'green', text: 'Đã thanh toán' },
      2: { color: 'red', text: 'Đã hủy' }
    };
    const config = statusConfig[status] || { color: 'default', text: 'Không xác định' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTotalAmountOfOrganizer = (organizerId) => {
    const data = bookingMap[organizerId];
    if (!data || !data.workshops) return 0;

    return data.workshops.reduce((sum, ws) => sum + (ws.totalAmount || 0), 0);
  };

  const getWorkshopRevenueTotalFromBookings = () => {
    let total = 0;
    Object.values(bookingMap).forEach((organizerData) => {
      organizerData?.workshops?.forEach(ws => {
        total += ws.totalAmount || 0;
      });
    });
    return total;
  };

  const bookingColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (orderCode) => <Text strong className="text-blue-600">#{orderCode}</Text>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity) => <Tag color="blue">{quantity}</Tag>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (price) => <Text strong className="text-green-600">{formatCurrency(price)}</Text>
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
      render: (date) => <Text type="secondary">{formatDateTime(date)}</Text>
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'purchasedAt',
      key: 'purchasedAt',
      render: (date) => <Text type="secondary">{date ? formatDateTime(date) : 'Chưa thanh toán'}</Text>
    }
  ];

  useEffect(() => {
    // Sau khi đã có danh sách organizer, tự động fetch booking cho tất cả
    organizerTableData.forEach(org => {
      if (!bookingMap[org.id]) {
        fetchBookingsByOrganizer(org.id);
      }
    });
    // eslint-disable-next-line
  }, [organizerTableData]);

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Workshop</h1>
              <Button type="primary" onClick={exportToExcel}>Xuất báo cáo</Button>
            </div>
          </div>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <DollarOutlined className="text-white text-xl" />
                  </div>
                  <RiseOutlined className="text-green-500 text-xl" />
                </div>
                <Statistic
                  title={<Text className="text-gray-600 font-medium">Tổng Doanh Thu</Text>}
                  value={totalRevenue} // Updated to use totalRevenue from state
                  formatter={value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)}
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
                        - Phí hoa hồng (3%): {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue * 0.03)}
                      </Text>
                      <br />
                      <Text strong className="text-green-600" style={{ fontSize: 14 }}>
                        Thực nhận: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue * 0.97)}
                      </Text>
                    </div>
                  </Panel>
                </Collapse>
              </Card>
            </Col>
            {/* Các card khác giữ nguyên, dùng statsData */}
            {statsData.map((stat, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={24}>
              <Card title="Danh sách Workshop" className="p-2">
          
                <Table
                  dataSource={workshops.filter(w =>
                    w.title.toLowerCase().includes(searchWorkshop.toLowerCase()) ||
                    w.organizer.toLowerCase().includes(searchWorkshop.toLowerCase())
                  )}
                  columns={workshopColumns}
                  rowKey="id"
                  pagination={{
                    total: totalWorkshops,
                    pageSize: workshopPageSize,
                    current: workshopPage,
                    onChange: setWorkshopPage,
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} workshops`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;