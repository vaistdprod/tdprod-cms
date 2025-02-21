"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import dynamic from 'next/dynamic';

const SwiperComponent = dynamic(() => import('./SwiperComponent'), {
  ssr: false,
});

interface Testimonial {
  author: string;
  role?: string;
  content: string;
  rating: string;
  image?: {
    url: string;
  };
}

interface TestimonialsGridProps {
  heading: string;
  subheading?: string;
  testimonials: Testimonial[];
  style: {
    layout: 'grid' | 'carousel' | 'masonry';
    textAlignment: 'left' | 'center';
    padding: {
      top: string;
      bottom: string;
    };
    background: 'white' | 'light' | 'brand';
    showRatings: boolean;
    showImages: boolean;
  };
}

export const TestimonialsGrid: React.FC<TestimonialsGridProps> = ({
  heading,
  subheading,
  testimonials,
  style,
}) => {
  const backgroundStyles = {
    white: 'bg-white',
    light: 'bg-gray-50',
    brand: 'bg-blue-50',
  };

  const containerStyles = {
    textAlign: style.textAlignment as 'left' | 'center',
    paddingTop: style.padding.top,
    paddingBottom: style.padding.bottom,
  };

  const renderRatingStars = (rating: string) => {
    const stars = [];
    const ratingNumber = parseInt(rating, 10);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < ratingNumber ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }

    return <div className="flex space-x-1">{stars}</div>;
  };

  const renderTestimonial = (testimonial: Testimonial, index: number) => {
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: index * 0.1,
        },
      },
    };

    return (
      <motion.div
        key={`${testimonial.author}-${index}`}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`bg-white rounded-xl shadow-lg p-6 ${
          style.layout === 'masonry' ? 'mb-6' : ''
        }`}
      >
        {style.showImages && testimonial.image && (
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src={testimonial.image.url}
                alt={testimonial.author}
                fill
                className="object-cover rounded-full"
              />
            </div>
          </div>
        )}
        <blockquote className="text-gray-600 mb-4">{testimonial.content}</blockquote>
        <div className="text-center">
          <cite className="font-semibold text-gray-900 not-italic">
            {testimonial.author}
          </cite>
          {testimonial.role && (
            <p className="text-sm text-gray-500 mt-1">{testimonial.role}</p>
          )}
          {style.showRatings && (
            <div className="flex justify-center mt-2">
              {renderRatingStars(testimonial.rating)}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
    </div>
  );

  const renderCarousel = () => (
    <SwiperComponent
      testimonials={testimonials}
      renderTestimonial={renderTestimonial}
    />
  );

  const renderMasonry = () => {
    const columns = testimonials.reduce(
      (acc, testimonial, i) => {
        acc[i % 3].push(testimonial);
        return acc;
      },
      [[], [], []] as Testimonial[][]
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-6">
            {column.map((testimonial, index) =>
              renderTestimonial(testimonial, columnIndex * 3 + index)
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section
      style={containerStyles}
      className={`py-16 ${backgroundStyles[style.background]}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
          {subheading && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </motion.div>

        {style.layout === 'carousel' && renderCarousel()}
        {style.layout === 'grid' && renderGrid()}
        {style.layout === 'masonry' && renderMasonry()}
      </div>
    </section>
  );
};
