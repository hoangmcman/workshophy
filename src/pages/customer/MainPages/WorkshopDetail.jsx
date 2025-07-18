import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Eye, Star, Edit, Trash } from 'lucide-react';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import CustomeFooter from '../../../components/customer/CustomeFooter';
import ApiService from '../../../service/ApiService';
import { message } from 'antd';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import LoadingScreen from '../../utilities/LoadingScreen';

dayjs.extend(utc);
dayjs.extend(timezone);

const WorkshopDetail = () => {
    const { workshopId } = useParams();
    const navigate = useNavigate();
    const [workshop, setWorkshop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarWorkshops, setSimilarWorkshops] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [userCanReview, setUserCanReview] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const userId = localStorage.getItem('userId');

    const mapStatusToDisplay = (status) => {
        switch (status) {
            case 0: return 'OFFLINE';
            case 1: return 'ONLINE';
            default: return 'UNKNOWN';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await ApiService.getWorkshopById(workshopId);
                const workshopData = res?.data?.data;

                if (!res || res.status !== 200 || !workshopData) {
                    message.error('Không thể tải chi tiết workshop.');
                    setLoading(false);
                    return;
                }

                const mappedWorkshop = {
                    ...workshopData,
                    status: mapStatusToDisplay(workshopData.status),
                    organizer: `${workshopData.userInfo?.firstName || ''} ${workshopData.userInfo?.lastName || ''}` || 'Unknown Organizer'
                };
                setWorkshop(mappedWorkshop);

                // Check user can review
                const ticketsResponse = await ApiService.getWorkshopTickets();
                if (ticketsResponse.status === 200 && ticketsResponse.data) {
                    const userTickets = ticketsResponse.data.data.items.filter(
                        ticket => ticket.userId === userId && ticket.workshopId === workshopId && ticket.paymentStatus === 'Completed'
                    );
                    setUserCanReview(userTickets.length > 0);
                }

                // ✅ Fetch Reviews
                const reviewsResponse = await ApiService.getAllReviews({
                    Page: 1,
                    PageSize: 10,
                    workshopId: workshopId
                });
                if (reviewsResponse.status === 200 && reviewsResponse.data) {
                    console.log("Fetched reviews:", reviewsResponse.data.data.items);
                    setReviews(reviewsResponse.data.data.items || []);
                }

                // Similar Workshops
                const workshopsResponse = await ApiService.getAllWorkshops();
                if (workshopsResponse.status === 200 && workshopsResponse.data) {
                    const filteredWorkshops = workshopsResponse.data.data.items.filter(w => w.workshopId !== workshopId);
                    setSimilarWorkshops(filteredWorkshops.slice(0, 3));
                }
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu workshop:', err);
                message.error('Đã xảy ra lỗi trong quá trình tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        if (workshopId) {
            fetchData();
        } else {
            message.error('Không tìm thấy ID workshop.');
            setLoading(false);
        }
    }, [workshopId, userId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!userCanReview) {
            message.error('Bạn cần hoàn thành đặt vé và thanh toán để để lại đánh giá.');
            return;
        }

        const reviewData = {
            userId: userId,
            workshopId: workshopId,
            rating: newReview.rating,
            comment: newReview.comment || " " // ✅ Cho phép comment rỗng
        };

        console.log("Sending review:", reviewData);

        try {
            const response = await ApiService.createReview(reviewData);
            if (response.status === 200) {
                message.success('Đánh giá đã được gửi thành công.');
                setNewReview({ rating: 0, comment: '' });

                // ✅ Fetch lại review
                const reviewsResponse = await ApiService.getAllReviews({
                    Page: 1,
                    PageSize: 10,
                    workshopId: workshopId
                });
                if (reviewsResponse.status === 200 && reviewsResponse.data) {
                    console.log("Fetched reviews after submit:", reviewsResponse.data.data.items);
                    setReviews(reviewsResponse.data.data.items || []);
                }
            } else {
                message.error(response.message || 'Không thể gửi đánh giá.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi gửi đánh giá.');
            console.error("Review submit error:", error);
        }
    };

    const handleEditReview = async (reviewId, currentRating, currentComment) => {
        const updatedReview = {
            reviewId: reviewId,
            userId: userId,
            workshopId: workshopId,
            rating: currentRating,
            comment: currentComment || " "
        };
        try {
            const response = await ApiService.updateReview(reviewId, updatedReview);
            if (response.status === 200) {
                message.success('Đánh giá đã được cập nhật thành công.');
                const reviewsResponse = await ApiService.getAllReviews({
                    Page: 1,
                    PageSize: 10,
                    workshopId: workshopId
                });
                if (reviewsResponse.status === 200 && reviewsResponse.data) {
                    setReviews(reviewsResponse.data.data.items || []);
                }
            } else {
                message.error(response.message || 'Không thể cập nhật đánh giá.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi cập nhật đánh giá.');
            console.error(error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            const response = await ApiService.deleteReview(reviewId);
            if (response.status === 200) {
                message.success('Đánh giá đã được xóa thành công.');
                const reviewsResponse = await ApiService.getAllReviews({
                    Page: 1,
                    PageSize: 10,
                    workshopId: workshopId
                });
                if (reviewsResponse.status === 200 && reviewsResponse.data) {
                    setReviews(reviewsResponse.data.data.items || []);
                }
            } else {
                message.error(response.message || 'Không thể xóa đánh giá.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi xóa đánh giá.');
            console.error(error);
        }
    };

    const handleRatingChange = (rating) => {
        setNewReview({ ...newReview, rating });
    };

    const handleBookNow = () => {
        if (workshop && userId) {
            const workshopData = {
                workshopId: workshop.workshopId,
                title: workshop.title,
                instructor: workshop.organizer,
                date: dayjs(workshop.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY'),
                time: `${dayjs(workshop.startTime).tz('Asia/Ho_Chi_Minh').format('HH:mm')} - ${dayjs(workshop.endTime).tz('Asia/Ho_Chi_Minh').format('HH:mm')}`,
                location: workshop.location,
                originalPrice: workshop.price,
                image: workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'
            };
            localStorage.setItem('selectedWorkshop', JSON.stringify(workshopData));
            navigate('/checkout');
        } else {
            message.error('Vui lòng đăng nhập để đặt vé.');
        }
    };

    // ✅ Hàm tách YouTube video ID từ URL
    const extractYouTubeId = (url) => {
        if (!url) return '';
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : '';
    };

    if (loading) {
        return <LoadingScreen />;
    }
    if (!workshop) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Không thể tải thông tin workshop.</div></div>;

    const displayedReviews = showAllReviews ? reviews.slice(0, 15) : reviews.slice(0, 5);

    return (
        <div className="min-h-screen">
            <CustomerHeader />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="relative mb-6">
                            <img
                                src={workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'}
                                alt={workshop.title}
                                className="w-full h-64 md:h-80 object-cover rounded-lg"
                            />
                            <div className="absolute top-4 right-4">
                                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {workshop.status}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{workshop.title}</h1>
                            <p className="text-gray-600 text-lg">{workshop.description}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">THÔNG TIN CHI TIẾT</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <MapPin size={20} className="text-gray-400 mr-3 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-900">Địa điểm</p>
                                        <p className="text-gray-600">{workshop.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Users size={20} className="text-gray-400 mr-3 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-900">Người tổ chức</p>
                                        <p className="text-gray-600">{workshop.organizer}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar size={20} className="text-gray-400 mr-3 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-900">Lịch chi tiết</p>
                                        <p className="text-gray-600">
                                            {dayjs.utc(workshop.startTime).tz('Asia/Ho_Chi_Minh').format('dddd, D MMMM YYYY, HH:mm')} - {dayjs.utc(workshop.endTime).tz('Asia/Ho_Chi_Minh').format('HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {workshop.introVideoUrl && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">VIDEO GIỚI THIỆU</h2>
                                <div className="relative">
                                    <iframe
                                        className="w-full h-64 md:h-96 rounded-lg"
                                        src={`https://www.youtube.com/embed/${extractYouTubeId(workshop.introVideoUrl)}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">MÔ TẢ</h2>
                            <div className="text-gray-600 whitespace-pre-line">
                                {workshop.description}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                ĐÁNH GIÁ
                                <span className="text-sm text-gray-500 ml-2">Đánh giá gần đây</span>
                            </h2>
                            <div className="space-y-4 mb-6">
                                {displayedReviews.map((review) => (
                                    <div key={review.reviewId} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={review.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                                            alt={review.userId}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{review.userName || review.userId}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Star size={16} className="text-yellow-500 fill-current mr-1" />
                                                    <span className="text-sm font-medium text-gray-900">{review.rating || 0}</span>
                                                    {userId === review.userId && (
                                                        <>
                                                            <Edit
                                                                size={16}
                                                                className="text-blue-500 cursor-pointer ml-2"
                                                                onClick={() => handleEditReview(review.reviewId, review.rating, review.comment)}
                                                            />
                                                            <Trash
                                                                size={16}
                                                                className="text-red-500 cursor-pointer ml-2"
                                                                onClick={() => handleDeleteReview(review.reviewId)}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment || 'No comment'}</p>
                                        </div>
                                    </div>
                                ))}
                                {reviews.length > 5 && (
                                    <button
                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                        className="text-blue-500 hover:underline mt-2"
                                    >
                                        {showAllReviews ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}
                            </div>

                            {ApiService.isAuthenticated() && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Để lại đánh giá của bạn</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-medium mb-2">Đánh giá của bạn</label>
                                            <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={24}
                                                        className={`cursor-pointer ${newReview.rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                                        onClick={() => handleRatingChange(star)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-medium mb-2">Bình luận</label>
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows="4"
                                                placeholder="Viết nhận xét của bạn..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-[#091238] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                                            disabled={!userCanReview || !newReview.rating}
                                        >
                                            Gửi đánh giá
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-[#091238] text-white rounded-lg p-6 sticky top-4">
                            <h3 className="text-lg font-semibold mb-4">Thông tin vé</h3>
                            <div className="mb-4">
                                <h4 className="text-xl font-bold mb-2">{workshop.title}</h4>
                                <div className="flex items-center text-sm opacity-80 mb-2">
                                    <MapPin size={14} className="mr-1" />
                                    <span>{workshop.location}</span>
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className="text-2xl font-bold mb-2">Giá từ: {workshop.price.toLocaleString('vi-VN')} VNĐ</div>
                                <button
                                    onClick={handleBookNow}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                >
                                    ĐẶT VÉ NGAY
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">WORKSHOP BẠN CÓ THỂ THÍCH</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similarWorkshops.map((workshop) => {
                            const shortDesc = workshop.description
                                ? workshop.description.split(' ').slice(0, 15).join(' ') + (workshop.description.split(' ').length > 15 ? '...' : '')
                                : '';
                            return (
                                <div key={workshop.workshopId} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'}
                                            alt={workshop.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {workshop.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {shortDesc}
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar size={16} className="mr-2 text-gray-700" />
                                                <span>{new Date(workshop.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin size={16} className="mr-2 text-gray-700" />
                                                <span className="line-clamp-1">{workshop.location}</span>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg font-bold text-[#091238]">{workshop.price.toLocaleString('vi-VN')} VNĐ</span>
                                                {workshop.originalPrice && (
                                                    <span className="text-sm text-gray-500 line-through">{workshop.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            to={`/workshopdetail/${workshop.workshopId}`}
                                            className="w-full bg-[#091238] hover:bg-opacity-90 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 no-underline"
                                        >
                                            <Eye size={16} />
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <CustomeFooter />
        </div>
    );
};

export default WorkshopDetail;