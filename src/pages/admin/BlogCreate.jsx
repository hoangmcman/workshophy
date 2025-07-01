import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ApiService from '../../service/ApiService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const BlogCreate = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
            });
            navigate('/login'); // Redirect to login if userId is missing
            return;
        }

        // Validate userId format (basic UUID format check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Định dạng ID người dùng không hợp lệ. Vui lòng đăng nhập lại.',
            });
            navigate('/login');
            return;
        }

        const blogData = {
            title: formData.title,
            content: formData.content,
            userId: userId
        };

        try {
            const response = await ApiService.createBlogPost(blogData);
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Blog đã được tạo thành công!',
                }).then(() => {
                    navigate('/bloglist');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: response.message || 'Không thể tạo blog. Vui lòng thử lại.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Đã xảy ra lỗi khi tạo blog. Vui lòng thử lại.',
            });
        }
    };

    const handleReset = () => {
        setFormData({
            title: '',
            content: ''
        });
    };

    return (
        <div className="flex h-screen">
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <AdminHeader />
                
                {/* Blog Create Form */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-[#091238] rounded-lg shadow-lg p-6">
                            <h2 className="text-white text-xl font-semibold mb-6">Tạo Blog Mới</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Blog Title */}
                                <div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tiêu đề blog"
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-white text-sm font-medium mb-2">Nội dung bài viết</h3>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        placeholder="Nhập nội dung chi tiết của blog"
                                        required
                                        rows="8"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-6">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Tạo Blog
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCreate;