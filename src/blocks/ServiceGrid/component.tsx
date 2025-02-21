"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Service {
  title: string;
  description: string;
  icon: string;
}

interface ServiceGridProps {
  heading: string;
  subheading?: string;
  layout: 'grid' | 'list' | 'cards' | 'features';
  style: {
    textAlignment: 'left' | 'center' | 'right';
    padding: {
      top: string;
      bottom: string;
    };
    columns: '2' | '3' | '4';
    background: 'white' | 'light' | 'brand';
  };
  services: Service[];
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  heading,
  subheading,
  layout,
  style,
  services,
}) => {
  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  };

  const backgroundStyles = {
    white: 'bg-white',
    light: 'bg-gray-50',
    brand: 'bg-blue-50',
  };

  const containerStyles = {
    textAlign: style.textAlignment as 'left' | 'center' | 'right',
    paddingTop: style.padding.top,
    paddingBottom: style.padding.bottom,
  };

  const renderService = (service: Service, index: number) => {
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

    if (layout === 'cards') {
      return (
        <motion.div
          key={service.title}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="text-4xl mb-4">{service.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
          <p className="text-gray-600">{service.description}</p>
        </motion.div>
      );
    }

    if (layout === 'list') {
      return (
        <motion.div
          key={service.title}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-300"
        >
          <div className="text-3xl text-blue-600">{service.icon}</div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        </motion.div>
      );
    }

    if (layout === 'features') {
      return (
        <motion.div
          key={service.title}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative pl-16"
        >
          <div className="absolute left-0 top-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl text-blue-600">
            {service.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
          <p className="text-gray-600">{service.description}</p>
        </motion.div>
      );
    }

    // Default grid layout
    return (
      <motion.div
        key={service.title}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center"
      >
        <div className="text-4xl mb-4 text-blue-600">{service.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
        <p className="text-gray-600">{service.description}</p>
      </motion.div>
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

        <div
          className={`grid grid-cols-1 gap-8 ${
            layout === 'list' ? '' : gridCols[style.columns as keyof typeof gridCols]
          }`}
        >
          {services.map((service, index) => renderService(service, index))}
        </div>
      </div>
    </section>
  );
};
