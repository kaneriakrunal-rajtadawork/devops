"use client";
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '@/components/layout/Navbar';
import ProjectCard from '../../../components/features/projects/shared/ProjectCard';
import { useGetApiProjects } from '@/api-client';

const ProjectsPage = () => {
    const [filter, setFilter] = React.useState('');
    const [fetchingAfterCreate, setFetchingAfterCreate] = React.useState(false);
    const user = useSelector((state) => state.auth.user);

    // Use the Orval-generated hook for fetching projects
    const { 
        data: projectsResponse, 
        isLoading, 
        error,
        refetch 
    } = useGetApiProjects(
        { user_id: user?.userId }, // Query parameters
        { 
           query: {
             enabled: !!user?.userId, // Only run query if user ID exists
           }
        }
    );

    // Extract projects from the API response
    const projects = projectsResponse?.data?.data || [];

    const handleProjectCreated = (newProject) => {
        setFetchingAfterCreate(true);
        // Refetch projects after creation
        refetch().finally(() => {
            setFetchingAfterCreate(false);
        });
    };

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    // Memoize filtered projects for performance
    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.title?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [projects, filter]);

    if (!user) {
        return (
            <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col overflow-hidden items-stretch mx-auto pt-6 max-md:max-w-full layout-min-height">
                <Navbar onProjectCreated={handleProjectCreated} onFilterChange={handleFilterChange} />
                <div className="px-8 h-[450px] flex items-center justify-center">
                    <p>Please log in to see your projects.</p>
                </div>
            </div>
        );
    }

    if (isLoading || fetchingAfterCreate) {
        return (
            <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col overflow-hidden items-stretch mx-auto pt-6 max-md:max-w-full layout-min-height">
                <Navbar onProjectCreated={handleProjectCreated} onFilterChange={handleFilterChange} />
                <div className="px-8 h-[450px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col overflow-hidden items-stretch mx-auto pt-6 max-md:max-w-full layout-min-height">
                <Navbar onProjectCreated={handleProjectCreated} onFilterChange={handleFilterChange} />
                <div className="px-8 h-[450px] flex items-center justify-center">
                    <div className="text-red-500">
                        Error: {error?.message || 'Failed to load projects'}
                        <button 
                            onClick={() => refetch()} 
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col overflow-hidden items-stretch mx-auto pt-6 max-md:max-w-full layout-min-height">
            <Navbar onProjectCreated={handleProjectCreated} onFilterChange={handleFilterChange} />
            <div className="px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <ProjectCard
                                id={project.id}
                                key={project.id}
                                name={project.title}
                                description={project.description}
                            />
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center h-32 text-gray-500">
                            {filter ? 'No projects match your filter.' : 'No projects found.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;