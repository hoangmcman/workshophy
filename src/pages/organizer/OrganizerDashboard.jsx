import React, { useState, useEffect } from 'react';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';
import OrganizerHeader from '../../components/organizer/OrganizerHeader';
import { Card, Row, Col, message } from 'antd';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Calendar, DollarSign, Award, Eye } from 'lucide-react';
import ApiService from '../../service/ApiService';
Chart.register(...registerables);

const OrganizerDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [statsData, setStatsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);

    useEffect(() => {
        const fetchOrganizerAnalytics = async () => {
            setLoading(true);
            try {
                const response = await ApiService.getOrganizerAnalytics();
                if (response.status === 200 && response.data) {
                    const data = response.data.data;
                    setStatsData([
                        { title: 'Tổng Vé Đã Mua', value: data.totalTicketBoughtForOwnWorkshop || 0, icon: <Calendar />, color: '#1890ff' },
                        { title: 'Tổng Doanh Thu', value: data.revenue || 0, prefix: '₫', icon: <DollarSign />, color: '#faad14' },
                        { title: 'Đánh Giá Gần Nhất', value: data.currentReview ? `${data.currentReview.rating}/5 - ${data.currentReview.comment}` : 'N/A', icon: <Award />, color: '#52c41a' },
                        { title: 'Workshop Đánh Giá Cao Nhất', value: data.bestRatingWorkshop ? data.bestRatingWorkshop.title : 'N/A', icon: <Eye />, color: '#f5222d' }
                    ]);
                    // Lấy dữ liệu doanh thu theo tháng từ API này nếu có
                    if (Array.isArray(data.monthlyRevenue)) {
                        setMonthlyRevenueData(data.monthlyRevenue);
                    }
                }
            } catch (error) {
                message.error('Failed to fetch organizer analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizerAnalytics();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Chart.js data cho doanh thu theo tháng
    const revenueBarData = {
        labels: monthlyRevenueData.map(item => item.month),
        datasets: [
            {
                label: 'Doanh thu (₫)',
                data: monthlyRevenueData.map(item => item.revenue),
                backgroundColor: '#1890ff',
                yAxisID: 'y1',
            },
            {
                label: 'Số Workshop',
                data: monthlyRevenueData.map(item => item.workshops),
                backgroundColor: '#faad14',
                yAxisID: 'y2',
            },
        ],
    };

    const revenueBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return tooltipItem.dataset.label + ': ' + tooltipItem.raw.toLocaleString() + (tooltipItem.dataset.yAxisID === 'y1' ? ' ₫' : '');
                    },
                },
            },
        },
        scales: {
            y1: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: 'Doanh thu (₫)' },
                ticks: { callback: value => `${value / 1000000}M` },
            },
            y2: {
                type: 'linear',
                position: 'right',
                title: { display: true, text: 'Số Workshop' },
                grid: { drawOnChartArea: false },
            },
        },
    };

    return (
        <div className="flex h-screen">
            <OrganizerSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <OrganizerHeader />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <Row gutter={[16, 16]} className="mb-6">
                            {loading ? (
                                <Col xs={24}>
                                    <Card loading={true} />
                                </Col>
                            ) : (
                                statsData.map((stat, index) => (
                                    <Col xs={24} sm={12} lg={6} key={index}>
                                        <Card className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                                {stat.icon && React.cloneElement(stat.icon, { className: `w-8 h-8 ${stat.color.replace('#', 'text-')}` })}
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                                            <div className="text-sm text-gray-500">{stat.title}</div>
                                            <div className="text-xs text-green-500 mt-1">+10% từ tháng trước</div>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>

                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={24} lg={16}>
                                <Card title="Doanh thu theo tháng" className="h-[500px]">
                                    <div style={{ height: 420 }}>
                                        <Bar data={revenueBarData} options={revenueBarOptions} height={420} />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default OrganizerDashboard
