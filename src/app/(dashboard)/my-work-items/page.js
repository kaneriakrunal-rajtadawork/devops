"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bug, Wrench, Crown, BookOpen, GitCommit, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/layout/Navbar';

const MyWorkItemsPage = () => {
    const [assignedToMe, setAssignedToMe] = useState([]);
    const [myActivity, setMyActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAssignedToMeOpen, setIsAssignedToMeOpen] = useState(true);
    const [isMyActivityOpen, setIsMyActivityOpen] = useState(true);
    const user = useSelector((state) => state.auth.user);
    useEffect(() => {
        const fetchWorkItems = async () => {
            if (!user || !user.id) {
                setAssignedToMe([]);
                setMyActivity([]);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch(`/api/work-items?user_id=${user.id}`);
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Unauthorized. Please log in.');
                    }
                    throw new Error('Failed to fetch work items');
                }
                const data = await response.json();
                setAssignedToMe(data.assignedToMe);
                setMyActivity(data.myActivity);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching work items:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkItems();
    }, [user]);

    if (loading) {
        return (
            <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col min-h-screen">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-red-500 text-lg">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex w-full flex-col overflow-y-auto items-stretch mx-auto">
            <Navbar />
            <main className="px-8 py-6 space-y-8">
                <section>
                    <ListHeader
                        title="Assigned to me"
                        isOpen={isAssignedToMeOpen}
                        onToggle={() => setIsAssignedToMeOpen(!isAssignedToMeOpen)}
                    />
                    {isAssignedToMeOpen && (
                        <div>
                            {assignedToMe.length > 0 ? (
                                assignedToMe.map(item => <ListItem key={item._id} {...item} />)
                            ) : (
                                <p className="text-gray-500 pl-8 pt-2">No work items assigned to you.</p>
                            )}
                        </div>
                    )}
                </section>
                <section>
                    <ListHeader
                        title="My activity"
                        isOpen={isMyActivityOpen}
                        onToggle={() => setIsMyActivityOpen(!isMyActivityOpen)}
                    />
                    {isMyActivityOpen && (
                        <div>
                            {myActivity.length > 0 ? (
                                myActivity.map(item => <ListItem key={item._id} {...item} />)
                            ) : (
                                <p className="text-gray-500 pl-8 pt-2">You have not created any work items yet.</p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MyWorkItemsPage;

const ListHeader = ({ title, isOpen, onToggle }) => (
    <header
        className="flex gap-2 items-center cursor-pointer mb-2 p-1 rounded hover:bg-gray-100"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        aria-expanded={isOpen}
    >
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        <h1 className="text-lg font-semibold">{title}</h1>
    </header>
);

const workItemIcons = {
    bug: <Bug className="text-red-500" size={16} />,
    feature: <Wrench className="text-green-500" size={16} />,
    epic: <Crown className="text-yellow-500" size={16} />,
    story: <BookOpen className="text-blue-500" size={16} />,
    default: <GitCommit className="text-gray-500" size={16} />,
};

const ListItem = ({ type, title, number, projectName, status, updatedAt }) => {
    const icon = workItemIcons[type] || workItemIcons.default;
    const formattedDate = `Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`;
    
    return (
        <article className="border-b border-gray-200">
            <div className="flex items-center justify-between p-3 hover:bg-gray-100">
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <h2 className="text-base font-medium">{title}</h2>
                        <div className="text-xs text-gray-500">
                            #{number} in <a href="#" className="underline hover:text-blue-600">{projectName}</a>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-12 text-sm text-gray-700">
                    <StatusIndicator status={status} />
                    <time dateTime={updatedAt} className="w-40 text-right">{formattedDate}</time>
                </div>
            </div>
        </article>
    );
};

const statusColors = {
    new: "bg-gray-500",
    active: "bg-blue-500",
    doing: "bg-blue-500",
    resolved: "bg-yellow-600",
    closed: "bg-green-600",
    default: "bg-gray-400",
};
export const StatusIndicator = ({ status }) => {
    const color = statusColors[status.toLowerCase()] || statusColors.default;
    return (
        <div className="flex items-center gap-2 w-28">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
    );
};
