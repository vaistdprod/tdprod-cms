import React from 'react';
import { ComponentImplementation } from '../types';
import { componentRegistry } from '../ComponentRegistry';

const AppointmentScheduler: ComponentImplementation = {
  id: 'appointment-scheduler',
  name: 'Appointment Scheduler',
  category: 'industry',
  version: '1.0.0',
  description: 'A comprehensive appointment scheduling component for healthcare providers',
  schema: {
    title: { type: 'text', required: true },
    description: { type: 'textarea' },
    availableServices: {
      type: 'relationship',
      relationTo: 'medical-services',
      hasMany: true,
    },
    showInsuranceField: { type: 'checkbox', defaultValue: true },
  },
  defaultProps: {
    style: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'var(--background-alt)',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  },
  variants: {
    embedded: {
      style: {
        padding: '1rem',
        maxWidth: '100%',
        margin: '0',
        boxShadow: 'none',
      },
    },
    fullWidth: {
      style: {
        maxWidth: '100%',
        borderRadius: '0',
      },
    },
  },
  render: ({ props }) => {
    const {
      title,
      description,
      availableServices = [],
      showInsuranceField = true,
      style,
    } = props;

    const [selectedService, setSelectedService] = React.useState('');
    const [selectedDate, setSelectedDate] = React.useState('');
    const [selectedTime, setSelectedTime] = React.useState('');
    const [insuranceProvider, setInsuranceProvider] = React.useState('');
    const [formStep, setFormStep] = React.useState(1);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Handle appointment submission
      console.log('Appointment details:', {
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        insuranceProvider,
      });
    };

    return (
      <div style={style}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {description && <p className="text-gray-600 mb-6">{description}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {formStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                >
                  <option value="">Choose a service...</option>
                  {availableServices.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setFormStep(2)}
                disabled={!selectedService}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                Next: Choose Date & Time
              </button>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              {showInsuranceField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="Enter your insurance provider"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  },
};

// Register the component
componentRegistry.registerComponent(AppointmentScheduler);

export default AppointmentScheduler;
