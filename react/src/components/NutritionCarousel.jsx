import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

// Import custom styles
import './NutritionCarousel.css';

const NutritionCarousel = ({ items }) => {
  return (
    <Swiper
      effect="coverflow"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={3}
      spaceBetween={20}
      loop={true}
      coverflowEffect={{
        rotate: 10,
        stretch: 0,
        depth: 200,
        modifier: 1.2,
        slideShadows: false,
        scale: 0.9,
      }}
      breakpoints={{
        640: {
          slidesPerView: 3,
          coverflowEffect: {
            rotate: 10,
            stretch: 0,
            depth: 200,
            modifier: 1.2,
            scale: 0.9
          }
        }
      }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true
      }}
      modules={[EffectCoverflow, Pagination, Autoplay]}
      className="nutrition-carousel"
    >
      {items.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="carousel-card">
            <div className="card-inner">
              <div className="card-image">
                <img 
                  src={item.image} 
                  alt={item.title}
                  onError={(e) => {
                    console.log(`Failed to load image for ${item.title}`);
                    e.target.src = "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=300&h=200&fit=crop";
                  }}
                  loading="lazy"
                />
              </div>
              <h4 className="card-title">{item.title}</h4>
              <div className="card-subtitle">{item.subtitle}</div>
              <div className="nutrients-list">
                {item.nutrients.map((nutrient, i) => (
                  <span key={i} className="nutrient-tag">{nutrient}</span>
                ))}
              </div>
              <div className="card-benefits">{item.benefits}</div>
              <div className="card-description">{item.description}</div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default NutritionCarousel;