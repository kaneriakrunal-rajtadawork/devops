'use client';

import React from 'react';

const ExperiencePage = () => {
  const experiences = [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Mahindra',
      period: 'December 2021 - Present',
      location: 'India',
      description: [
        'Leading development of enterprise-level web applications using MERN stack',
        'Architecting scalable solutions and implementing best practices',
        'Mentoring junior developers and conducting code reviews',
        'Collaborating with cross-functional teams to deliver high-quality solutions',
      ],
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
    },
    // Add previous experiences as needed
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Professional Experience
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Over 8 years of experience in full stack development
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-8">
            {experiences.map((experience, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {experience.title}
                    </h3>
                    <p className="text-lg font-medium text-blue-600">
                      {experience.company}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 text-gray-500">
                    <p>{experience.period}</p>
                    <p>{experience.location}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Key Responsibilities & Achievements
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {experience.description.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Technologies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Achievements Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Key Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Project Delivery',
                description:
                  'Successfully delivered 20+ enterprise projects on time and within budget',
              },
              {
                title: 'Team Leadership',
                description:
                  'Led and mentored teams of 5-8 developers, improving team productivity by 30%',
              },
              {
                title: 'Technical Innovation',
                description:
                  'Implemented innovative solutions resulting in 40% improvement in application performance',
              },
            ].map((achievement, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {achievement.title}
                </h4>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Education
          </h3>
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Bachelor of Technology in Computer Science
                </h4>
                <p className="text-gray-600">University Name</p>
              </div>
              <p className="text-gray-500 mt-2 md:mt-0">2011 - 2015</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage; 