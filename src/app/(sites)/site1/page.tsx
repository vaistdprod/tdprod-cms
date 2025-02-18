import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPhone, faLocationDot, faEnvelope } from "@fortawesome/free-solid-svg-icons"

export default function Site1Home() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-heading font-bold text-site1-primary">
              Dr. Sarah's Practice
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-site1-primary transition-colors">
                Home
              </a>
              <a href="#services" className="text-gray-700 hover:text-site1-primary transition-colors">
                Services
              </a>
              <a href="#contact" className="text-gray-700 hover:text-site1-primary transition-colors">
                Contact
              </a>
              <a href="#about" className="text-gray-700 hover:text-site1-primary transition-colors">
                About Us
              </a>
              <button className="bg-site1-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors">
                Book Appointment
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contact Information Section */}
      <section className="bg-site1-secondary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="flex items-center justify-center space-x-4 bg-white p-6 rounded-lg shadow-sm">
              <FontAwesomeIcon 
                icon={faPhone} 
                className="text-site1-primary text-2xl"
              />
              <div>
                <h3 className="font-heading font-semibold">Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center justify-center space-x-4 bg-white p-6 rounded-lg shadow-sm">
              <FontAwesomeIcon 
                icon={faLocationDot} 
                className="text-site1-primary text-2xl"
              />
              <div>
                <h3 className="font-heading font-semibold">Address</h3>
                <p className="text-gray-600">123 Healing Street, Medical District</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center space-x-4 bg-white p-6 rounded-lg shadow-sm">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="text-site1-primary text-2xl"
              />
              <div>
                <h3 className="font-heading font-semibold">Email</h3>
                <p className="text-gray-600">contact@drsarah.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with CTA Buttons */}
      <section className="bg-gradient-to-r from-site1-primary/10 to-site1-secondary/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-800 mb-6">
            Caring for Your Children with Love and Expertise
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Providing compassionate pediatric care in a warm, welcoming environment
            that makes both children and parents feel comfortable.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-site1-primary text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition-colors text-lg">
              How to reach us
            </button>
            <button className="bg-white text-site1-primary border-2 border-site1-primary px-8 py-3 rounded-full hover:bg-site1-primary/5 transition-colors text-lg">
              Meet our team
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
