import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    CreditCard,
    Receipt,
    DollarSign,
    ArrowLeft,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
} from 'lucide-react';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import CustomeFooter from '../../../components/customer/CustomeFooter';
import ApiService from '../../../service/ApiService';
import { useNavigate } from 'react-router-dom';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const response = await ApiService.getBookingsForCustomer({
                    page: 1,
                    pageSize: 10
                });

                if (response.status === 200 && response.data.success) {
                    // Sắp xếp theo trạng thái: Thành công (1) -> Đang xử lý (2) -> Thất bại (0)
                    const sortedPayments = response.data.data.items.map(payment => ({
                        ...payment,
                        bookings: payment.bookings.sort((a, b) => b.status - a.status)
                    })).sort((a, b) => {
                        const statusA = a.bookings[0]?.status || 0;
                        const statusB = b.bookings[0]?.status || 0;
                        return statusB - statusA; // 1 > 2 > 0
                    });
                    setPayments(sortedPayments);
                } else {
                    console.error('Failed to fetch payments:', response.message);
                    setPayments([]);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 1:
                return <CheckCircle size={20} className="text-green-500" />;
            case 0:
                return <XCircle size={20} className="text-red-500" />;
            case 2:
                return <AlertCircle size={20} className="text-yellow-500" />;
            default:
                return <AlertCircle size={20} className="text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 1:
                return 'Thành công';
            case 0:
                return 'Thất bại';
            case 2:
                return 'Đang xử lý';
            default:
                return 'Không xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 1:
                return 'bg-green-100 text-green-800';
            case 0:
                return 'bg-red-100 text-red-800';
            case 2:
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.accountBank.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.bookings.some(booking =>
                booking.orderCode.toString().includes(searchTerm)
            );

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <CustomerHeader />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <a href="/" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-600 hover:text-gray-900" />
                        </a>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1>
                            <p className="text-gray-600 mt-1">Xem lại các giao dịch đã thực hiện</p>
                        </div>
                    </div>
                    <div className="bg-[#091238] text-white px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                            <Receipt size={20} className="mr-2" />
                            <span className="font-medium">{payments.length} giao dịch</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo ngân hàng hoặc mã đơn hàng..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#091238] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="mt-8 bg-gradient-to-r from-[#091238] to-[#1e3a8a] text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Tổng quan thanh toán</h3>
                            <p className="text-sm opacity-80">
                                Tổng cộng {payments.length} giao dịch
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold mb-1">
                                {formatCurrency(
                                    payments.reduce((total, payment) => total + payment.totalAmount, 0)
                                )}
                            </div>
                            <div className="text-sm opacity-80">Tổng chi tiêu</div>
                        </div>
                    </div>
                </div>

                {/* Payment History List */}
                <div className="space-y-6 mt-5">
                    {filteredPayments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Bạn chưa thanh toán hay đặt vé workshop nào hết
                            </h3>
                            <a
                                onClick={() => navigate('/', { state: { scrollTo: 'featured' } })}
                                className="inline-block bg-[#091238] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors cursor-pointer"
                            >
                                Đặt vé ngay
                            </a>
                        </div>
                    ) : (
                        filteredPayments.map((payment, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Payment Header */}
                                <div className="bg-[#091238] text-white p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CreditCard size={24} className="mr-3" />
                                            <div>
                                                <h3 className="text-lg font-semibold">{payment.accountBank}</h3>
                                                <p className="text-sm opacity-80">Tổng thanh toán: {formatCurrency(payment.totalAmount)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{formatCurrency(payment.totalAmount)}</div>
                                            <div className="text-sm opacity-80">{payment.bookings.length} workshop</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {payment.bookings.map((booking, bookingIndex) => (
                                            <div key={bookingIndex} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <FileText size={20} className="text-gray-400 mr-3" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                Mã đơn hàng: #{booking.orderCode}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                ID: {booking.bookingId.substring(0, 8)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(booking.status)}
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                            {getStatusText(booking.status)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center text-gray-600">
                                                        <DollarSign size={16} className="mr-2" />
                                                        <span>Giá: {formatCurrency(booking.totalPrice)}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <Calendar size={16} className="mr-2" />
                                                        <span>Đặt: {formatDate(booking.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <Clock size={16} className="mr-2" />
                                                        <span>
                                                            {booking.purchasedAt ? `Thanh toán: ${formatDate(booking.purchasedAt)}` : 'Chưa thanh toán'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-600">
                                                            Số lượng: {booking.quantity} vé
                                                        </div>
                                                        <div className="text-lg font-semibold text-[#091238]">
                                                            {formatCurrency(booking.totalPrice)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <CustomeFooter />
        </div>
    );
};

export default PaymentHistory;