"use client"; // Needed for hooks like useParams if you were to use them, though params are passed directly here.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import DescriptionModal from '@/components/features/projects/overview/summary/DescriptionModal';
import ProjectStatsSection from './ProjectStatsSection';
import ProjectMembersSection from './ProjectMembersSection';


const ProjectDetailsPage = ({ projectName }) => {
    const router = useRouter();
    const { token, user } = useSelector((state) => state.auth);
    
    // State management
    const [project, setProject] = useState(null);
    const [projectStats, setProjectStats] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [descModalOpen, setDescModalOpen] = useState(false);
    const [descLoading, setDescLoading] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch project data
    useEffect(() => {
        if (!token) {
            router.push('/signin');
            return;
        }
        
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch project details
                const projectRes = await fetch(`/api/projects/title/${projectName}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!projectRes.ok) {
                    const errorData = await projectRes.json();
                    throw new Error(errorData.error || 'Failed to fetch project');
                }
                
                const projectData = await projectRes.json();
                setProject(projectData);
                // Fetch project stats
                const statsRes = await fetch(`/api/projects/${projectData._id}/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setProjectStats(statsData);
                }
                
                // Fetch project members
                const membersRes = await fetch(`/api/projects/${projectData._id}/members`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (membersRes.ok) {
                    const membersData = await membersRes.json();
                    setProjectMembers(membersData);
                }
                
            } catch (err) {
                setError(err.message);
                console.error('Error fetching project data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProjectData();
    }, [projectName, token]);

    // Save description and other fields
    const handleSaveDescription = async (fields) => {
        if (!token || !project) return;
        setDescLoading(true);
        try {
            // Validate tags and repository
            if (fields.tags && fields.tags.length > 10) throw new Error('Maximum 10 tags allowed');
            if (!fields.repository || fields.repository === 'Select a repository') throw new Error('Please select a repository');
            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: fields.description,
                    tags: fields.tags,
                    about: fields.about,
                    repository: fields.repository
                })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update project');
            }
            const updatedProject = await res.json();
            setProject(updatedProject);
            setDescModalOpen(false);
        } catch (err) {
            setError(err.message);
            console.error('Error updating project:', err);
        } finally {
            setDescLoading(false);
        }
    };

    // Handle like/unlike project
    const handleToggleLike = async () => {
        if (!token || !project || likeLoading) return;
        
        try {
            setLikeLoading(true);
            const res = await fetch(`/api/projects/${project._id}/like`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to toggle like');
            }
            
            const updatedProject = await res.json();
            setProject(updatedProject);
        } catch (err) {
            setError(err.message);
            console.error('Error toggling like:', err);
        } finally {
            setLikeLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading project...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-center">
                    <div className="text-xl font-semibold mb-2">Error</div>
                    <div>{error}</div>
                    <button 
                        onClick={() => router.push('/projects')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-xl font-semibold mb-2">Project Not Found</div>
                    <button 
                        onClick={() => router.push('/projects')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="px-2 pr-4 p-5 flex w-full gap-5 flex-wrap justify-between max-md:max-w-full">
                <div className="flex gap-6 text-3xl font-bold tracking-tighter text-black">
                    <h1 className="self-start">{project?.title}</h1>
                </div>
                <nav className="flex gap-2 items-start self-start text-sm font-semibold text-center">
                    <button className="flex gap-3 px-3.5 py-2 text-black rounded-sm bg-gray-300 bg-opacity-10">
                        <span>Private</span>
                    </button>
                    <button className="flex gap-3 px-3.5 py-2 text-white bg-sky-600 rounded-sm">
                        <span>Invite</span>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="pb-10 max-h-[600px] overflow-y-auto h-screen pt-6 pr-6 pl-2 w-full font-semibold bg-stone-50 max-md:pr-5 max-md:max-w-full">
                
                {/* Project Description Section */}
                <section className="flex overflow-hidden flex-wrap gap-5 justify-between pt-5 pr-20 pb-5 pl-5 text-sm text-black bg-white rounded shadow-[0px_3px_7px_rgba(0,0,0,0.133)] max-md:pr-5 max-md:max-w-full">
                    <div className="flex flex-col items-start max-md:max-w-full flex-1 min-w-[250px] w-full">
                        {/* Heading row with actions */}
                        <div className="flex w-full items-center justify-between mb-2">
                            <h2 className="text-xl tracking-tight">About this project</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleToggleLike}
                                    disabled={likeLoading}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-base font-medium transition-colors ${
                                        project.likes?.includes(user?.id)
                                            ? 'text-black bg-gray-200 hover:bg-gray-300'
                                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                    } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span>{project.likes?.includes(user?.id) ? '🖤 Liked' : '🤍 Like'}</span>
                                    <span className="ml-1 text-xs">{project.likes?.length || 0}</span>
                                </button>
                                <button
                                    onClick={() => setDescModalOpen(true)}
                                    className="flex items-center gap-1 px-2 py-1 rounded text-base text-blue-600 hover:bg-blue-50"
                                    title={project.description ? 'Edit Description' : 'Add Description'}
                                >
                                    <span>✏️</span>
                                </button>
                            </div>
                        </div>
                                                {/* Description or Add button */}
                        {project.description ? (
                            <div className="self-stretch mt-6 max-md:max-w-full w-full">
                                <p className="mb-4 break-words whitespace-pre-line">{project.description}</p>
                            </div>
                        ) : (
                            <div className="self-stretch mt-6 max-md:max-w-full w-full">
                                <button
                                    className="flex items-center gap-2 px-5 py-2 text-center text-blue-700 border border-blue-400 rounded hover:bg-blue-50 font-medium shadow-sm"
                                    onClick={() => setDescModalOpen(true)}
                                >
                                    <span className="text-xl">+</span> Add Project Description
                                </button>
                            </div>
                        )}

                        {/* Tags Section */}
                        {project.tags && project.tags.length > 0 && (
                            <div className="self-stretch mt-4 max-md:max-w-full w-full">
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {!project.description && (
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/dd044ee45e1d85da2eeeccd5be02cfcebf1210cc?placeholderIfAbsent=true"
                        className="object-contain shrink-0 self-end mt-14 max-w-full aspect-[1.61] w-[169px] max-md:mt-10"
                        alt="Project illustration"
                    />
                    )}
                </section>

                {/* Project Stats Section */}
                <ProjectStatsSection projectId={project._id} />

                {/* Project Members Section */}
                <ProjectMembersSection projectId={project._id} />
            </div>

            {/* Description Modal (bottom-right) */}
            <DescriptionModal
                open={descModalOpen}
                onClose={() => setDescModalOpen(false)}
                initialValue={project.description || ''}
                initialTags={project.tags || []}
                initialAbout={project.about || 'readme'}
                initialRepository={project.repository || 'Select a repository'}
                onSave={handleSaveDescription}
                loading={descLoading}
            />
        </>
    );
};

export default ProjectDetailsPage;

// StatCard Component
export const StatCard = ({ icon, value, label }) => {
    return (
        <article className="flex flex-1 gap-4">
            <div className="text-2xl">{icon}</div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
            </div>
        </article>
    );
};


