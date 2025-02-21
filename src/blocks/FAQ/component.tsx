"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Question {
  question: string;
  answer: {
    root: {
      children: Array<{
        text?: string;
        children?: Array<{ text: string }>;
      }>;
    };
  };
  category?: string;
}

interface FAQProps {
  heading: string;
  subheading?: string;
  questions: Question[];
  style: {
    layout: 'accordion' | 'grid' | 'tabs';
    textAlignment: 'left' | 'center';
    padding: {
      top: string;
      bottom: string;
    };
    background: 'white' | 'light' | 'brand';
    showCategories: boolean;
    expandFirst: boolean;
  };
}

export const FAQ: React.FC<FAQProps> = ({
  heading,
  subheading,
  questions,
  style,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    style.expandFirst ? 0 : null
  );
  
  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    const firstCategory = questions.find(q => q.category)?.category;
    return style.showCategories && firstCategory ? firstCategory : null;
  });

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

  const categories = style.showCategories
    ? Array.from(new Set(questions.map(q => q.category).filter(Boolean)))
    : [];

  const filteredQuestions = style.showCategories && activeCategory
    ? questions.filter(q => q.category === activeCategory)
    : questions;

  const extractText = (answer: Question['answer']) => {
    return answer.root.children
      .map(node => {
        if (node.text) return node.text;
        if (node.children) {
          return node.children.map(child => child.text).join('');
        }
        return '';
      })
      .join('\n');
  };

  const renderAccordion = () => (
    <div className="space-y-4">
      {filteredQuestions.map((item, index) => (
        <motion.div
          key={index}
          initial={false}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="font-medium text-gray-900">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                expandedIndex === index ? 'transform rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200"
              >
                <div className="p-4 prose prose-sm max-w-none">
                  {extractText(item.answer)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredQuestions.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-3">{item.question}</h3>
          <div className="prose prose-sm">
            {extractText(item.answer)}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTabs = () => (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <div className="space-y-2">
          {filteredQuestions.map((item, index) => (
            <button
              key={index}
              onClick={() => setExpandedIndex(index)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                expandedIndex === index
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.question}
            </button>
          ))}
        </div>
      </div>
      <div className="md:w-2/3">
        <AnimatePresence mode="wait">
          {expandedIndex !== null && (
            <motion.div
              key={expandedIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm prose prose-sm"
            >
              {extractText(filteredQuestions[expandedIndex].answer)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

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

        {style.showCategories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category || null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {style.layout === 'accordion' && renderAccordion()}
        {style.layout === 'grid' && renderGrid()}
        {style.layout === 'tabs' && renderTabs()}
      </div>
    </section>
  );
};
