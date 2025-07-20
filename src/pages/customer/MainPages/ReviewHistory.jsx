import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Search } from 'lucide-react';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import CustomeFooter from '../../../components/customer/CustomeFooter';
import ApiService from '../../../service/ApiService';
import { useNavigate } from 'react-router-dom';

const ReviewHistory = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const userId = localStorage.getItem('userId');
    const reviewsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await ApiService.getAllReviews({ page: currentPage, pageSize: reviewsPerPage, userId });
                if (response.status === 200 && response.data.success) {
                    const reviewsWithTitles = await Promise.all(response.data.data.items.map(async (review) => {
                        const workshopResponse = await ApiService.getWorkshopById(review.workshopId);
                        if (workshopResponse.status === 200 && workshopResponse.data.data) {
                            return { ...review, workshopTitle: workshopResponse.data.data.title };
                        }
                        return { ...review, workshopTitle: 'Unknown Workshop' };
                    }));
                    setReviews(reviewsWithTitles);
                } else {
                    console.error('Failed to fetch reviews:', response.message);
                    setReviews([]);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchReviews();
        } else {
            navigate('/login');
        }
    }, [currentPage, userId, navigate]);

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

    const filteredReviews = reviews.filter(review =>
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <CustomerHeader />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <a href="/" className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-600 hover:text-gray-900" />
                        </a>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Lịch sử đánh giá</h1>
                            <p className="text-gray-600 mt-1">Xem lại các đánh giá đã thực hiện</p>
                        </div>
                    </div>
                    <div className="bg-[#091238] text-white px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                            <Star size={20} className="mr-2" />
                            <span className="font-medium">{reviews.length} đánh giá</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo bình luận..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#091238] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredReviews.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Star size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Bạn chưa đánh giá workshop nào hết
                            </h3>
                            <a
                                onClick={() => navigate('/')}
                                className="inline-block bg-[#091238] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors cursor-pointer"
                            >
                                Quay lại trang chủ
                            </a>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.reviewId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="bg-[#091238] text-white p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Star size={24} className="mr-3" />
                                            <div>
                                                <h3 className="text-lg font-semibold">Workshop: {review.workshopTitle || 'Unknown'}</h3>
                                                <p className="text-sm opacity-80">Đánh giá ngày: {new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <div className="flex items-center mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 mt-2">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="mr-2 px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="px-4 py-2 bg-gray-300 rounded-lg"
                    >
                        Next
                    </button>
                </div>
            </div>
            <CustomeFooter />
        </div>
    );
};

export default ReviewHistory;