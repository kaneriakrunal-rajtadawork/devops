'use client';

import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const ProjectsPage = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      description:
        'A full-featured e-commerce platform built with MERN stack, featuring product management, cart functionality, and secure payment integration.',
      image: '/projects/ecommerce.jpg', // Add your project image
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Redux', 'Stripe'],
      githubUrl: '#',
      liveUrl: '#',
      highlights: [
        'Implemented secure payment processing with Stripe',
        'Built responsive UI with Material-UI',
        'Integrated real-time inventory management',
      ],
    },
    {
      title: 'Task Management System',
      description:
        'A collaborative task management system with real-time updates, team management, and progress tracking features.',
      image: '/projects/task-management.jpg', // Add your project image
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'JWT'],
      githubUrl: '#',
      liveUrl: '#',
      highlights: [
        'Implemented real-time updates using Socket.io',
        'Built drag-and-drop interface for task management',
        'Integrated role-based access control',
      ],
    },
    // Add more projects as needed
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Featured Projects
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            A selection of my recent development projects
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-16">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Project Image */}
                  <div className="relative h-64 lg:h-full">
                    <div className="absolute inset-0 bg-gray-300">
                      {/* Add your project image here */}
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-8">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {project.title}
                      </h3>
                      <div className="flex space-x-4">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                          <Github size={24} />
                        </a>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                          <ExternalLink size={24} />
                        </a>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-600">{project.description}</p>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Key Features
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        {project.highlights.map((highlight, highlightIndex) => (
                          <li key={highlightIndex}>{highlight}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Activity */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            GitHub Contributions
          </h3>
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <p className="text-center text-gray-600">
              View more of my projects and contributions on{' '}
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage; 