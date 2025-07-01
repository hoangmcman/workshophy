import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tabs } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import ApiService from '../../service/ApiService';
import Swal from 'sweetalert2';

const RequestList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [workshopRequests, setWorkshopRequests] = useState([]);
  const [allWorkshops, setAllWorkshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalWorkshops, setTotalWorkshops] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWorkshopPage, setCurrentWorkshopPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (activeTab === '1') {
      fetchWorkshopRequests();
    } else {
      fetchAllWorkshops();
    }
  }, [currentPage, currentWorkshopPage, activeTab]);

  const fetchWorkshopRequests = async () => {
    try {
      const params = {
        pageSize: itemsPerPage,
        page: currentPage,
        includeDeleted: false
      };
      const response = await ApiService.getPendingWorkshopsForAdmin(params);
      if (response.status === 200) {
        const items = response.data.data?.items || response.data.items || [];
        const total = response.data.data?.count || response.data.totalItems || 0;
        const formattedRequests = items.map((workshop) => ({
          id: workshop.workshopId,
          name: workshop.title,
          description: workshop.description,
          image: workshop.image || "https://images.stockcake.com/public/5/4/1/5417e74f-10cd-4be6-b128-85492eb59acc_large/creative-team-meeting-stockcake.jpg",
          submittedDate: workshop.createdAt,
          reviewDate: workshop.updatedAt || "",
          date: workshop.startDate || new Date(workshop.createdAt).toISOString(),
          time: workshop.startDate && workshop.endDate
            ? `${new Date(workshop.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(workshop.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
            : 'N/A',
          location: workshop.location,
          status: workshop.status === 0 ? 'pending' : workshop.status === 1 ? 'approved' : 'rejected',
          price: `${workshop.price.toLocaleString('vi-VN')} VNĐ`,
          organizer: `${workshop.userInfo?.firstName || ''} ${workshop.userInfo?.lastName || ''}` || 'Unknown Organizer',
          category: workshop.category?.name || 'Uncategorized',
          reviewNotes: workshop.reviewNotes || ""
        }));
        setWorkshopRequests(formattedRequests);
        setTotalItems(total);
      } else {
        console.error('Failed to fetch workshop requests:', response.message);
      }
    } catch (error) {
      console.error('Fetch Workshop Requests Error:', error);
    }
  };

  const fetchAllWorkshops = async () => {
    try {
      const params = {
        pageSize: itemsPerPage,
        page: currentWorkshopPage,
        includeDeleted: false
      };
      const response = await ApiService.getAllWorkshops(params);
      if (response.status === 200) {
        const items = response.data.data?.items || response.data.items || [];
        const total = response.data.data?.count || response.data.totalItems || 0;
        const formattedWorkshops = items.map((workshop) => ({
          id: workshop.workshopId,
          name: workshop.title,
          description: workshop.description,
          date: workshop.startDate || new Date(workshop.createdAt).toISOString(),
          time: workshop.startDate && workshop.endDate
            ? `${new Date(workshop.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(workshop.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
            : 'N/A',
          location: workshop.location,
          status: workshop.status === 0 ? 'pending' : workshop.status === 1 ? 'approved' : 'rejected',
          price: `${workshop.price.toLocaleString('vi-VN')} VNĐ`,
          organizer: `${workshop.userInfo?.firstName || ''} ${workshop.userInfo?.lastName || ''}` || 'Unknown Organizer',
          category: workshop.category?.name || 'Uncategorized'
        }));
        setAllWorkshops(formattedWorkshops);
        setTotalWorkshops(total);
      } else {
        console.error('Failed to fetch all workshops:', response.message);
      }
    } catch (error) {
      console.error('Fetch All Workshops Error:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã phê duyệt';
      case 'pending':
        return 'Đang chờ duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  const handleDelete = async (workshopId, workshopName) => {
    const result = await Swal.fire({
      title: 'Xóa yêu cầu',
      text: `Bạn có chắc chắn muốn xóa yêu cầu "${workshopName}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiService.deleteWorkshop(workshopId);
        if (response.status === 200) {
          if (activeTab === '1') {
            setWorkshopRequests(workshopRequests.filter(w => w.id !== workshopId));
          } else {
            setAllWorkshops(allWorkshops.filter(w => w.id !== workshopId));
          }
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: `Đã xóa yêu cầu "${workshopName}" thành công!`,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xóa yêu cầu!',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Đã xảy ra lỗi khi xóa yêu cầu!',
        });
      }
    }
  };

  const showDetails = (record) => {
    navigate(`/requestdetail/${record.id}`);
  };

  const showWorkshopDetails = (record) => {
    navigate(`/adminworkshopdetail/${record.id}`);
  };

  const filteredRequests = workshopRequests.filter(workshop =>
    workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkshops = allWorkshops.filter(workshop =>
    workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsPending = [
    {
      title: 'Tên Workshop',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span>{text.length > 50 ? text.substring(0, 50) + '...' : text}</span>,
    },
    {
      title: 'Người tổ chức',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetails(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id, record.name)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const columnsAll = [
    {
      title: 'Tên Workshop',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span>{text.length > 50 ? text.substring(0, 50) + '...' : text}</span>,
    },
    {
      title: 'Người tổ chức',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showWorkshopDetails(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const onTabChange = (key) => {
    setActiveTab(key);
    setSearchTerm('');
    setCurrentPage(1);
    setCurrentWorkshopPage(1);
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <Tabs activeKey={activeTab} onChange={onTabChange} type="card">
                <Tabs.TabPane tab="Quản lý Phê duyệt Workshop" key="1">
                  <div className="mb-4">
                    <Input
                      placeholder="Tìm kiếm theo tên, tổ chức, danh mục hoặc địa điểm..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: 300 }}
                      allowClear
                    />
                  </div>
                  <Table
                    columns={columnsPending}
                    dataSource={filteredRequests}
                    rowKey="id"
                    pagination={{
                      total: totalItems,
                      pageSize: itemsPerPage,
                      current: currentPage,
                      onChange: setCurrentPage,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                      pageSizeOptions: ['6', '12', '24', '50'],
                    }}
                    scroll={{ x: 1200 }}
                    size="middle"
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Quản lý các Workshop" key="2">
                  <div className="mb-4">
                    <Input
                      placeholder="Tìm kiếm theo tên, tổ chức, danh mục hoặc địa điểm..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: 300 }}
                      allowClear
                    />
                  </div>
                  <Table
                    columns={columnsAll}
                    dataSource={filteredWorkshops}
                    rowKey="id"
                    pagination={{
                      total: totalWorkshops,
                      pageSize: itemsPerPage,
                      current: currentWorkshopPage,
                      onChange: setCurrentWorkshopPage,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} workshop`,
                      pageSizeOptions: ['6', '12', '24', '50'],
                    }}
                    scroll={{ x: 1200 }}
                    size="middle"
                  />
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestList;