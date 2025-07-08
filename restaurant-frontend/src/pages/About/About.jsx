import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const aboutHero = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
const chefImage = 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80';
const teamMember1 = 'https://images.unsplash.com/photo-1547425260-769c1e14c2b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80';
const teamMember2 = 'https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80';
const teamMember3 = 'https://images.unsplash.com/photo-1614283233556-f35b7c841529?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80';

const About = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const teamMembers = [
    { name: 'Marco Rossi', role: 'Head Chef', image: chefImage },
    { name: 'Giulia Bianchi', role: 'Sous Chef', image: teamMember1 },
    { name: 'Luca Moretti', role: 'Pastry Chef', image: teamMember2 },
    { name: 'Sofia Romano', role: 'Restaurant Manager', image: teamMember3 },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        className="relative bg-cover bg-center h-96" 
        style={{ backgroundImage: `url(${aboutHero})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div 
            className="text-center text-white"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Our Culinary Story
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
              Discover the passion and tradition behind every dish we serve.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story Section */}
        <motion.section 
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="order-2 md:order-1">
            <h2 className="text-4xl font-bold text-orange-600 mb-4">
              From Our Kitchen to Your Heart
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Fine Dining Restaurant was born from a simple yet powerful idea: to create an unforgettable dining experience that blends traditional recipes with modern culinary techniques. Our journey began over a decade ago in a small, family-owned kitchen, fueled by a love for authentic flavors and the finest local ingredients.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, we continue to honor our roots while embracing innovation. Our menu is a testament to this philosophy, offering a symphony of tastes that tells a story of heritage, passion, and creativity. We believe that a meal is more than just food; it's a celebration of life, connection, and the joy of sharing.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <img 
              src={chefImage} 
              alt="Our Head Chef" 
              className="rounded-lg shadow-2xl w-full h-auto"
            />
          </div>
        </motion.section>

        {/* Our Mission Section */}
        <motion.section 
          className="text-center my-24"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            "To craft exquisite culinary moments that inspire and delight, by sourcing the freshest ingredients, fostering a culture of creativity, and serving every guest with warmth and genuine hospitality."
          </p>
        </motion.section>

        {/* Meet the Team Section */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Meet Our Passionate Team
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The artists behind our culinary magic.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                className="text-center"
                custom={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg mb-4 border-4 border-white"
                />
                <h3 className="text-xl font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-orange-600">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section 
          className="mt-24 bg-orange-600 rounded-lg text-white p-12 text-center"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience Fine Dining?
          </h2>
          <p className="text-lg mb-8">
            Explore our menu and reserve your table for an unforgettable evening.
          </p>
          <Link 
            to="/menu"
            className="bg-white text-orange-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-orange-100 transition-colors"
          >
            View Our Menu
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default About; 