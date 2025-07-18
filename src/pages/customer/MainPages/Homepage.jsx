import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Eye, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import CustomeFooter from '../../../components/customer/CustomeFooter';
import ApiService from '../../../service/ApiService';
import { message } from 'antd';
import LoadingScreen from '../../utilities/LoadingScreen';

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [recommendedWorkshops, setRecommendedWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const featuredRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollTo === 'featured' && featuredRef.current) {
      setTimeout(() => {
        featuredRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.state]);

  const carouselImages = [
    {
      id: 1,
      image: "https://d21klxpge3tttg.cloudfront.net/wp-content/uploads/2021/06/BACKYARD-BBQ.jpg",
      title: "THAM GIA NGAY",
      subtitle: "TỪ MÓN NƯỚNG ĐẬM VỊ ĐẾN TRÁNG MIỆNG NGỌT NGÀO",
      buttonText: "Khám phá workshop về ẩm thực"
    },
    {
      id: 2,
      image: "https://gobranding.com.vn/wp-content/uploads/2023/06/5-photographer-la-gi.jpg",
      title: "LƯU GIỮ KHOẢNH KHẮC",
      subtitle: "HỌC NHIẾP ẢNH CÙNG CHUYÊN GIA",
      buttonText: "Tham gia workshop nhiếp ảnh"
    },
    {
      id: 3,
      image: "https://caodangquoctehanoi.edu.vn/wp-content/uploads/2023/10/huong-nghiep-40-thiet-ke-do-hoa-7-1385x800-1.jpg",
      title: "SÁNG TẠO & THIẾT KẾ",
      subtitle: "THÀNH THẠO KỸ NĂNG THIẾT KẾ ĐỒ HỌA",
      buttonText: "Bắt đầu khám phá hôm nay"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryResponse = await ApiService.getAllCategories();
        if (categoryResponse.status === 200 && categoryResponse.data) {
          setCategories([
            { id: 'all', name: 'Tất cả', icon: Target },
            ...categoryResponse.data.data.items.map((item) => ({
              id: item.categoryId,
              name: item.name,
            }))
          ]);
        } else {
          message.error(categoryResponse.message || 'Không thể tải danh mục.');
        }

        const workshopResponse = await ApiService.getAllWorkshops();
        if (workshopResponse.status === 200 && workshopResponse.data) {
          setWorkshops(workshopResponse.data.data.items);
        } else {
          message.error(workshopResponse.message || 'Không thể tải workshop.');
        }

        const recommendedResponse = await ApiService.getRecommendedWorkshops();
        if (recommendedResponse.status === 200 && recommendedResponse.data) {
          setRecommendedWorkshops(recommendedResponse.data.data.items || []);
        } else {
          message.error(recommendedResponse.message || 'Không thể tải workshop theo sở thích.');
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const filteredWorkshops = selectedCategory === 'all'
    ? workshops
    : workshops.filter(workshop => workshop.categoryId === selectedCategory);

  const topTrendingWorkshops = [...workshops]
    .sort((a, b) => (b.participants || 0) - (a.participants || 0))
    .slice(0, 4);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    hover: { 
      scale: 1.05, 
      y: -10, 
      transition: { duration: 0.2 },
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen">
      <CustomerHeader />

      <motion.section
        className="py-8 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="relative w-full max-w-7xl mx-auto h-80 md:h-96 overflow-hidden rounded-xl shadow-lg">
          {carouselImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' :
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-8 py-10 bg-opacity-30 rounded-xl backdrop-blur-sm shadow-lg max-w-2xl mx-4">
                    <h3 className="text-sm md:text-base font-medium mb-2 bg-orange-500 px-4 py-2 rounded inline-block">
                      {slide.title}
                    </h3>
                    <h1 className="text-2xl md:text-4xl font-bold mb-6 leading-tight">
                      {slide.subtitle}
                    </h1>
                    <motion.button
                      className="bg-white text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors cursor-custom"
                      variants={buttonVariants}
                      whileHover="hover"
                    >
                      {slide.buttonText}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <motion.button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all shadow-lg z-10 cursor-custom"
            variants={buttonVariants}
            whileHover="hover"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all shadow-lg z-10 cursor-custom"
            variants={buttonVariants}
            whileHover="hover"
          >
            <ChevronRight size={24} />
          </motion.button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {carouselImages.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all cursor-custom ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                variants={buttonVariants}
                whileHover="hover"
              />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-2 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {categories.map((category) => {
              const Icon = category.icon || Target;
              return (
                <div key={category.id} className="flex flex-col items-center">
                  <motion.button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-all cursor-custom ${selectedCategory === category.id
                        ? 'bg-[#091238] text-white shadow-lg'
                        : 'bg-[#091238] bg-opacity-10 text-white hover:bg-opacity-20'
                      }`}
                    variants={buttonVariants}
                    whileHover="hover"
                  >
                    <Icon size={24} />
                  </motion.button>
                  <span className="mt-2 text-sm text-black text-center">
                    {category.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-8 px-4 bg-amber-100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Top Trending Workshop</h2>
          </div>

          {topTrendingWorkshops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không có workshop nào nổi bật.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topTrendingWorkshops.map((workshop) => (
                <motion.div
                  key={workshop.workshopId}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  variants={cardVariants}
                >
                  <div className="relative">
                    <img
                      src={workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'}
                      alt={workshop.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workshop.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{new Date(workshop.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span className="line-clamp-1">{workshop.location}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-lg font-bold text-[#091238]">{workshop.price.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <Link
                      to={`/workshopdetail/${workshop.workshopId}`}
                      className="w-full bg-[#091238] hover:bg-opacity-90 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 no-underline cursor-custom"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        className="py-8 px-4 bg-[#F5F2EA]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Workshop Theo Sở Thích</h2>
          </div>

          {recommendedWorkshops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không có workshop nào theo sở thích của bạn.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedWorkshops.map((workshop) => (
                <motion.div
                  key={workshop.workshopId}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  variants={cardVariants}
                >
                  <div className="relative">
                    <img
                      src={workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'}
                      alt={workshop.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workshop.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{new Date(workshop.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span className="line-clamp-1">{workshop.location}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-lg font-bold text-[#091238]">{workshop.price.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <Link
                      to={`/workshopdetail/${workshop.workshopId}`}
                      className="w-full bg-[#091238] hover:bg-opacity-90 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 no-underline cursor-custom"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        className="px-4 mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        ref={featuredRef}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">Workshop Nổi Bật</h2>
          </div>

          {filteredWorkshops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không có workshop nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredWorkshops.map((workshop) => (
                <motion.div
                  key={workshop.workshopId}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  variants={cardVariants}
                >
                  <div className="relative">
                    <img
                      src={workshop.image || 'https://thienanagency.com/photos/all/khac/workshop-painting.jpg'}
                      alt={workshop.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workshop.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{new Date(workshop.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-lg font-bold text-[#091238]">{workshop.price.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <Link
                      to={`/workshopdetail/${workshop.workshopId}`}
                      className="w-full bg-[#091238] hover:bg-opacity-90 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 no-underline cursor-custom"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        className="py-8 px-4 bg-[#F5F2EA]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center items-center text-center">
              <h2 className="text-3xl font-bold text-black mb-4">NHỮNG CÂU HỎI THƯỜNG GẶP</h2>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã kết nối nhiều cuộc hội thoại giữa các bạn thực mực. Dưới đây là tóm lược của chúng tôi.
              </p>
              <Link
                to="/faq"
                className="bg-[#091238] hover:bg-opacity-90 text-white py-3 px-6 w-32 rounded-lg font-medium transition-colors text-center cursor-custom"
              >
                FAQs
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="FAQ"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-8 px-4 bg-[#A9C1A6]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="About Us"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <h2 className="text-3xl font-bold text-white mb-4">VỀ CHÚNG TÔI</h2>
              <p className="text-white mb-6">
                Chúng tôi đã, đang và sẽ tiếp tục bất lực nhiệt đới để mang đến cho bạn những thông tin chính xác nhất có thể. Thêm vào đó, chúng tôi luôn sẵn sàng để mọi dự án đều có thể xem.
              </p>
              <Link
                to="/aboutus"
                className="bg-[#091238] hover:bg-opacity-90 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center cursor-custom"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <CustomeFooter />
    </div>
  );
};

export default Homepage;