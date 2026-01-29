'use client';

import React from 'react';

const SkillsPage = () => {
  const skillCategories = [
    {
      title: 'Frontend Development',
      skills: [
        { name: 'ReactJS', level: 90 },
        { name: 'JavaScript', level: 95 },
        { name: 'HTML5/CSS3', level: 90 },
        { name: 'TailwindCSS', level: 85 },
        { name: 'Redux', level: 85 },
      ],
    },
    {
      title: 'Backend Development',
      skills: [
        { name: 'NodeJS', level: 85 },
        { name: 'PHP (Laravel)', level: 80 },
        { name: 'Python', level: 75 },
        { name: 'RESTful APIs', level: 90 },
      ],
    },
    {
      title: 'Database',
      skills: [
        { name: 'MongoDB', level: 85 },
        { name: 'MySQL', level: 90 },
        { name: 'ElasticSearch', level: 75 },
      ],
    },
    {
      title: 'DevOps & Tools',
      skills: [
        { name: 'Git', level: 90 },
        { name: 'Docker', level: 75 },
        { name: 'CI/CD', level: 70 },
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Technical Skills
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            A comprehensive overview of my technical expertise and proficiency levels
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {skillCategories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {category.title}
                </h3>
                <div className="space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {skill.name}
                        </span>
                        <span className="text-sm font-medium text-gray-500">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${skill.level}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Skills & Tools */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Additional Skills & Tools
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'VS Code',
              'Postman',
              'JIRA',
              'Webpack',
              'npm/yarn',
              'Jest',
              'GraphQL',
              'AWS',
              'Linux',
              'Agile',
              'TypeScript',
              'Sass',
            ].map((tool, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-600">{tool}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Soft Skills
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                skill: 'Problem Solving',
                description: 'Analytical approach to complex technical challenges',
              },
              {
                skill: 'Team Collaboration',
                description: 'Effective communication and team coordination',
              },
              {
                skill: 'Project Management',
                description: 'Organizing and delivering projects on schedule',
              },
              {
                skill: 'Adaptability',
                description: 'Quick learning and adaptation to new technologies',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.skill}
                </h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage; 