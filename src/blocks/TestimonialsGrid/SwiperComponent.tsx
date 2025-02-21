"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Testimonial {
  author: string;
  role?: string;
  content: string;
  rating: string;
  image?: {
    url: string;
  };
}

interface SwiperComponentProps {
  testimonials: Testimonial[];
  renderTestimonial: (testimonial: Testimonial, index: number) => React.ReactNode;
}

const SwiperComponent: React.FC<SwiperComponentProps> = ({
  testimonials,
  renderTestimonial,
}) => {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      className="testimonials-swiper"
    >
      {testimonials.map((testimonial, index) => (
        <SwiperSlide key={`${testimonial.author}-${index}`}>
          {renderTestimonial(testimonial, index)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SwiperComponent;
