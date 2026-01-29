'use client';

import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        {/* About Me Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About Me
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Passionate Full Stack Developer with expertise in modern web technologies
          </p>
        </div>

        {/* Professional Summary */}
        <div className="mt-12">
          <div className="prose prose-blue mx-auto text-gray-500">
            <p className="text-lg">
              I am a Senior Full Stack Developer with over 8 years of experience in designing and implementing complex web applications. Currently working at Tech Mahindra since December 2021, I have been instrumental in delivering high-impact solutions for enterprise clients.
            </p>
            
            <p className="mt-4 text-lg">
              My journey in software development has been driven by a passion for creating efficient, scalable, and user-friendly applications. I specialize in the MERN stack (MongoDB, Express.js, React.js, Node.js) and have extensive experience with modern web technologies and best practices.
            </p>

            <p className="mt-4 text-lg">
              Throughout my career, I have focused on writing clean, maintainable code and implementing robust architectures that stand the test of time. I believe in continuous learning and staying updated with the latest industry trends and technologies.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Core Values
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h4>
              <p className="text-gray-600">
                Constantly exploring new technologies and approaches to solve complex problems efficiently.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Quality</h4>
              <p className="text-gray-600">
                Committed to writing clean, maintainable code and following best practices.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Collaboration</h4>
              <p className="text-gray-600">
                Strong team player with excellent communication and problem-solving skills.
              </p>
            </div>
          </div>
        </div>

        {/* Career Timeline */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Career Journey
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
            <div className="space-y-12">
              <div className="relative">
                <div className="ml-auto w-1/2 pl-10">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold text-gray-900">Senior Full Stack Developer</h4>
                    <p className="text-gray-600">Tech Mahindra</p>
                    <p className="text-sm text-gray-500">Dec 2021 - Present</p>
                  </div>
                </div>
              </div>
              {/* Add more timeline items as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 