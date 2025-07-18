import React, { useState, useEffect, useCallback } from 'react';
import { User, Search, LogOut, Wallet } from 'lucide-react';
import { Dropdown, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import debounce from 'lodash/debounce';

const CustomerHeader = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const fetchSuggestions = useCallback(
        debounce(async (term) => {
            if (term.trim() === '') {
                setSuggestions([]);
                setIsDropdownVisible(false);
                return;
            }

            try {
                const response = await ApiService.getAllWorkshops({
                    searchTerm: term,
                    pageSize: 5,
                    page: 1,
                });

                if (response.status === 200 && response.data?.data?.items) {
                    setSuggestions(response.data.data.items);
                    setIsDropdownVisible(true);
                } else {
                    setSuggestions([]);
                    setIsDropdownVisible(false);
                    message.error(response.message || 'Không thể tải gợi ý workshop.');
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setIsDropdownVisible(false);
                message.error('Đã xảy ra lỗi khi tìm kiếm workshop.');
            }
        }, 300),
        []
    );

    useEffect(() => {
        fetchSuggestions(searchTerm);
    }, [searchTerm, fetchSuggestions]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSuggestionClick = (workshopId) => {
        setSearchTerm('');
        setSuggestions([]);
        setIsDropdownVisible(false);
        setIsSearchOpen(false);
        navigate(`/workshopdetail/${workshopId}`);
    };

    const handleMenuClick = ({ key }) => {
        switch (key) {
            case 'profile':
                navigate('/userprofile');
                break;
            case 'paymenthistory':
                navigate('/paymenthistory');
                break;
            case 'signout':
                if (isLoggedIn) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                }
                navigate('/loginuser');
                break;
            default:
                break;
        }
    };

    const items = [
        {
            key: 'profile',
            label: (
                <Link to="/userprofile" className="flex items-center space-x-2 px-2 py-1">
                    <User size={16} />
                    <span>Hồ sơ cá nhân</span>
                </Link>
            ),
            disabled: !isLoggedIn,
        },
        {
            type: 'divider',
        },
        {
            key: 'paymenthistory',
            label: (
                <Link to="/paymenthistory" className="flex items-center space-x-2 px-2 py-1">
                    <Wallet size={16} />
                    <span>Lịch sử thanh toán</span>
                </Link>
            ),
            disabled: !isLoggedIn,
        },
        {
            type: 'divider',
        },
        {
            key: 'signout',
            label: (
                <Link to="/loginuser" className="flex items-center space-x-2 px-2 py-1 text-red-600">
                    <LogOut size={16} />
                    <span>{isLoggedIn ? 'Đăng xuất' : 'Đăng nhập'}</span>
                </Link>
            ),
        },
    ];

    return (
        <header className="bg-transparent px-4 py-3 flex flex-col md:flex-row items-center justify-between border-b border-gray-300">
            <div className="flex items-center justify-between w-full md:w-auto">
                <Link to="/"><h1 className="text-2xl font-bold text-[#091238]">Workshophy</h1></Link>
                <button
                    className="md:hidden text-gray-600"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                    <Search size={20} />
                </button>
            </div>
            <div className={`relative w-full md:w-[700px] ${isSearchOpen ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
                <input
                    type="text"
                    placeholder="Bạn muốn trải nghiệm workshop gì? Nhập tên workshop..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#091238]"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => suggestions.length > 0 && setIsDropdownVisible(true)}
                    onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {isDropdownVisible && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((workshop) => (
                            <div
                                key={workshop.workshopId}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                onMouseDown={() => handleSuggestionClick(workshop.workshopId)}
                            >
                                <img
                                    src={workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'}
                                    alt={workshop.title}
                                    className="w-10 h-10 rounded-md object-cover"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{workshop.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{workshop.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
                <Link to="/blog" className="text-gray-600 hover:text-blue-600 text-sm md:text-base">Blog</Link>
                <Link to="/faq" className="text-gray-600 hover:text-blue-600 text-sm md:text-base">FAQs</Link>
                <Link to="/aboutus" className="text-gray-600 hover:text-blue-600 text-sm md:text-base">Về chúng tôi</Link>
                <Dropdown
                    menu={{
                        items,
                        onClick: handleMenuClick,
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <div className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <User className="text-gray-600" size={24} />
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default CustomerHeader;