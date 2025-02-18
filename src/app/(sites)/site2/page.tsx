import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPhone, faLocationDot, faEnvelope, faStethoscope, faHeartbeat, faBrain } from "@fortawesome/free-solid-svg-icons"

export default function Site2Home() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-heading font-bold text-site2-accent">
              Professional Pediatric Clinic
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-site2-accent transition-colors">
                Home
              </a>
              <a href="#services" className="text-gray-700 hover:text-site2-accent transition-colors">
                Services
              </a>
              <a href="#contact" className="text-gray-700 hover:text-site2-accent transition-colors">
                Contact
              </a>
              <button className="bg-site2-accent text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                Book Appointment
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-site2-primary/20 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-800 mb-6">
            Providing Compassionate Pediatric Care You Can Trust
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Dedicated to your child's health and well-being
          </p>
          <button className="bg-site2-accent text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors text-lg">
            Contact Us
          </button>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="flex items-center justify-center space-x-4 p-6 rounded-lg bg-site2-primary/5">
              <FontAwesomeIcon 
                icon={faPhone} 
                className="text-site2-accent text-2xl"
              />
              <div>
                <h3 className="font-heading font-semibold">Phone</h3>
                <p className="text-gray-600">+1 (555) 987-6543</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center justify-center space-x-4 p-6 rounded-lg bg-site2-primary/5">
              <FontAwesomeIcon 
                icon={faLocationDot} 
                className="text-site2-accent text-2xl"
              />
              <div>
                <h3 className="font-heading font-semibold">Address</h3>
                <p className="text-gray-600">456 Medical Center Ave</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center space-x-4 p-6 rounded-lg bg-site2-primary/5">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="text-site2-accent text-2xl"
              />
              <div>
                <h3 className="font-heading font-semibold">Email</h3>
                <p className="text-gray-600">info@pediatricclinic.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-site2-secondary" id="services">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FontAwesomeIcon 
                icon={faStethoscope} 
                className="text-site2-accent text-3xl mb-4"
              />
              <h3 className="font-heading font-semibold text-xl mb-3 text-site2-accent">
                General Pediatrics
              </h3>
              <p className="text-gray-600">
                Comprehensive healthcare services for children from birth through adolescence.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FontAwesomeIcon 
                icon={faHeartbeat} 
                className="text-site2-accent text-3xl mb-4"
              />
              <h3 className="font-heading font-semibold text-xl mb-3 text-site2-accent">
                Preventive Care
              </h3>
              <p className="text-gray-600">
                Regular check-ups and screenings to maintain optimal health.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FontAwesomeIcon 
                icon={faBrain} 
                className="text-site2-accent text-3xl mb-4"
              />
              <h3 className="font-heading font-semibold text-xl mb-3 text-site2-accent">
                Developmental Assessment
              </h3>
              <p className="text-gray-600">
                Monitoring and evaluation of child growth and development milestones.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
