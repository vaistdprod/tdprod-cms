import React from 'react';
import { ComponentImplementation, ComponentProps, createComponent } from '../../../system';
import { Stack, Box } from '../../../system';

export interface AppointmentSchedulerProps extends ComponentProps {
  title?: string;
  description?: string;
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price?: number;
  }>;
  doctors?: Array<{
    id: string;
    name: string;
    specialty: string;
    availability?: {
      days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
      hours: { start: string; end: string; }[];
    };
  }>;
  onSchedule?: (appointment: {
    service: string;
    doctor: string;
    date: string;
    time: string;
    patientInfo: {
      name: string;
      email: string;
      phone: string;
      notes?: string;
    };
  }) => void;
}

const AppointmentScheduler: ComponentImplementation<AppointmentSchedulerProps> = {
  id: 'AppointmentScheduler',
  category: 'specialty',
  schema: {
    title: {
      type: 'text',
    },
    description: {
      type: 'text',
    },
    services: {
      type: 'array',
      fields: {
        value: {
          type: 'object',
          fields: {
            id: { type: 'text', required: true },
            name: { type: 'text', required: true },
            duration: { type: 'number', required: true },
            price: { type: 'number' },
          },
        },
      },
    },
    doctors: {
      type: 'array',
      fields: {
        value: {
          type: 'object',
          fields: {
            id: { type: 'text', required: true },
            name: { type: 'text', required: true },
            specialty: { type: 'text', required: true },
            availability: {
              type: 'object',
              fields: {
                days: {
                  type: 'array',
                  fields: {
                    value: { type: 'text' },
                  },
                },
                hours: {
                  type: 'array',
                  fields: {
                    value: {
                      type: 'object',
                      fields: {
                        start: { type: 'text' },
                        end: { type: 'text' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    onSchedule: {
      type: 'object',
    },
  },
  defaultProps: {
    title: 'Schedule an Appointment',
    description: 'Choose a service and preferred time to book your appointment.',
  },
  variants: {
    compact: {
      props: {
        style: {
          maxWidth: '600px',
          margin: '0 auto',
        },
      },
    },
    full: {
      props: {
        style: {
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        },
      },
    },
  },
  render: ({
    title,
    description,
    services = [],
    doctors = [],
    onSchedule,
    style,
    ...props
  }) => {
    const [selectedService, setSelectedService] = React.useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = React.useState<string | null>(null);
    const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
    const [patientInfo, setPatientInfo] = React.useState({
      name: '',
      email: '',
      phone: '',
      notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedService && selectedDoctor && selectedDate && selectedTime && onSchedule) {
        onSchedule({
          service: selectedService,
          doctor: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
          patientInfo,
        });
      }
    };

    return (
      <Box style={{ padding: '2rem', ...style }} {...props}>
        <Stack spacing="2rem">
          {title && (
            <Box as="h2" style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
              {title}
            </Box>
          )}
          
          {description && (
            <Box style={{ color: 'gray' }}>
              {description}
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing="1.5rem">
              {/* Service Selection */}
              <Box>
                <label>Select Service</label>
                <select
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration}min)
                      {service.price && ` - $${service.price}`}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Doctor Selection */}
              <Box>
                <label>Select Doctor</label>
                <select
                  value={selectedDoctor || ''}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Date Selection */}
              <Box>
                <label>Select Date</label>
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </Box>

              {/* Time Selection */}
              <Box>
                <label>Select Time</label>
                <input
                  type="time"
                  value={selectedTime || ''}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                />
              </Box>

              {/* Patient Information */}
              <Stack spacing="1rem">
                <Box>
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                    required
                  />
                </Box>

                <Box>
                  <label>Email</label>
                  <input
                    type="email"
                    value={patientInfo.email}
                    onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                    required
                  />
                </Box>

                <Box>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                    required
                  />
                </Box>

                <Box>
                  <label>Notes (Optional)</label>
                  <textarea
                    value={patientInfo.notes}
                    onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
                  />
                </Box>
              </Stack>

              <Box>
                <button type="submit">Schedule Appointment</button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </Box>
    );
  },
};

export default createComponent(AppointmentScheduler);
