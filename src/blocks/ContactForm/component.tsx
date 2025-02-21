"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  socialMedia?: Array<{
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
    url: string;
  }>;
}

interface ContactFormProps {
  heading: string;
  subheading?: string;
  formType: 'contact' | 'appointment';
  style: {
    layout: 'split' | 'centered' | 'full';
    textAlignment: 'left' | 'center';
    padding: {
      top: string;
      bottom: string;
    };
    background: 'white' | 'light' | 'brand';
  };
  contactInfo: {
    showContactInfo: boolean;
    showMap: boolean;
    showSocialMedia: boolean;
  };
  tenantInfo: ContactInfo;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  heading,
  subheading,
  formType,
  style,
  contactInfo,
  tenantInfo,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    // Additional fields for appointment requests
    ...(formType === 'appointment' && {
      preferredDate: '',
      preferredTime: '',
      reason: '',
    }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Here you would implement the actual form submission
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        ...(formType === 'appointment' && {
          preferredDate: '',
          preferredTime: '',
          reason: '',
        }),
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderSocialIcons = () => {
    const icons = {
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
    };

    return tenantInfo.socialMedia?.map(({ platform, url }) => {
      const Icon = icons[platform];
      return (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
        >
          <Icon className="w-6 h-6" />
        </a>
      );
    });
  };

  const renderContactInfo = () => (
    <div className="space-y-6">
      {tenantInfo.address && (
        <div className="flex items-start space-x-4">
          <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Address</h3>
            <p className="text-gray-600">{tenantInfo.address}</p>
          </div>
        </div>
      )}
      {tenantInfo.phone && (
        <div className="flex items-start space-x-4">
          <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Phone</h3>
            <p className="text-gray-600">{tenantInfo.phone}</p>
          </div>
        </div>
      )}
      <div className="flex items-start space-x-4">
        <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-gray-900">Email</h3>
          <p className="text-gray-600">{tenantInfo.email}</p>
        </div>
      </div>
      {contactInfo.showSocialMedia && tenantInfo.socialMedia && (
        <div className="flex space-x-4 pt-4">{renderSocialIcons()}</div>
      )}
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

        <div className={`grid ${style.layout === 'split' ? 'lg:grid-cols-2 gap-12' : 'grid-cols-1'}`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`${style.layout === 'centered' ? 'max-w-2xl mx-auto' : ''}`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {formType === 'appointment' && (
                <>
                  <div>
                    <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason for Visit
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              {formType === 'contact' && (
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting
                    ? 'Sending...'
                    : formType === 'appointment'
                    ? 'Request Appointment'
                    : 'Send Message'}
                </button>
              </div>
              {submitStatus === 'success' && (
                <div className="text-green-600 text-center">
                  Your message has been sent successfully!
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="text-red-600 text-center">
                  There was an error sending your message. Please try again.
                </div>
              )}
            </form>
          </motion.div>

          {style.layout === 'split' && contactInfo.showContactInfo && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {renderContactInfo()}
              {contactInfo.showMap && (
                <div className="aspect-w-16 aspect-h-9">
                  {/* Replace with actual map component */}
                  <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
