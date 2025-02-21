"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: {
    url: string;
  };
}

interface TeamGridProps {
  heading: string;
  subheading?: string;
  layout: 'grid' | 'list' | 'cards';
  style: {
    textAlignment: 'left' | 'center' | 'right';
    padding: {
      top: string;
      bottom: string;
    };
    columns: '2' | '3' | '4';
  };
  teamMembers: TeamMember[];
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  heading,
  subheading,
  layout,
  style,
  teamMembers,
}) => {
  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  };

  const containerStyles = {
    textAlign: style.textAlignment as 'left' | 'center' | 'right',
    paddingTop: style.padding.top,
    paddingBottom: style.padding.bottom,
  };

  const renderTeamMember = (member: TeamMember, index: number) => {
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
          key={member.name}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {member.image && (
            <div className="relative h-64">
              <Image
                src={member.image.url}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
            <p className="text-blue-600 mb-3">{member.role}</p>
            <p className="text-gray-600">{member.bio}</p>
          </div>
        </motion.div>
      );
    }

    if (layout === 'list') {
      return (
        <motion.div
          key={member.name}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-6 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
        >
          {member.image && (
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={member.image.url}
                alt={member.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
            <p className="text-blue-600 mb-2">{member.role}</p>
            <p className="text-gray-600">{member.bio}</p>
          </div>
        </motion.div>
      );
    }

    // Default grid layout
    return (
      <motion.div
        key={member.name}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center"
      >
        {member.image && (
          <div className="relative w-48 h-48 mx-auto mb-4">
            <Image
              src={member.image.url}
              alt={member.name}
              fill
              className="object-cover rounded-full"
            />
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
        <p className="text-blue-600 mb-3">{member.role}</p>
        <p className="text-gray-600">{member.bio}</p>
      </motion.div>
    );
  };

  return (
    <section style={containerStyles} className="py-16">
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
            gridCols[style.columns as keyof typeof gridCols]
          }`}
        >
          {teamMembers.map((member, index) => renderTeamMember(member, index))}
        </div>
      </div>
    </section>
  );
};
