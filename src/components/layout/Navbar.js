"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CreateProjectModal from '../modals/CreateProjectModal';
import { Filter } from 'lucide-react'; // Optional: replace with your preferred icons


const Navbar = ({ onProjectCreated, onFilterChange }) => {
    const router = useRouter();
    const pathname = usePathname();
    // Initialize activeTab, useEffect will correct it based on the current path.
    const [activeTab, setActiveTab] = useState('Projects');
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (pathname === '/my-pull-requests') {
            setActiveTab('My pull requests');
        } else if (pathname === '/my-work-items') {
            setActiveTab('My work items');
        } else if (pathname === '/') { // Assuming '/' is the route for 'Projects'
            setActiveTab('Projects');
        }
    }, [pathname]);

    const handleNavigation = (path, tabName) => {
        setActiveTab(tabName); // Set active tab immediately for responsiveness
        router.push(path);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        if (onFilterChange) onFilterChange(e.target.value);
    };

    return (
        <>
            <div className="px-8 flex w-full gap-5 flex-wrap justify-between max-md:max-w-full">
                <h1 className="text-black text-[21px] tracking-[-0.42px] font-semibold">
                    Synxa Organization
                </h1>
                {pathname === '/' && (
                    <div className="flex items-center gap-4">
                        <button
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                            onClick={() => setShowModal(true)}
                        >
                            New Project
                        </button>
                    </div>
                )}
                {pathname === '/my-pull-requests' && (
                    <button className="bg-[#8D8D8D] flex items-stretch gap-[11px] text-sm text-white text-center px-[13px] py-2 rounded-sm">
                        <span>Customize view</span>
                    </button>
                )}
            </div>
            <nav className="bg-[rgba(248,248,248,1)] flex w-full items-stretch gap-5 text-sm flex-wrap h-full justify-between pb-2 px-8 max-md:max-w-full max-md:px-5">
                {/* Adjusted pb-0 here as border-b will add visual space */}
                <div className="flex items-center gap-[19px]">
                    <button
                        onClick={() => handleNavigation('/', 'Projects')}
                        className={`cursor-pointer self-stretch whitespace-nowrap py-[17px] px-2 focus:outline-none border-b-2 ${activeTab === 'Projects'
                            ? 'font-semibold text-[rgba(0,120,212,1)] border-[rgba(0,120,212,1)]'
                            : 'font-normal text-black border-transparent'
                            }`}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => handleNavigation('/my-work-items', 'My work items')}
                        className={`cursor-pointer self-stretch whitespace-nowrap py-[17px] px-2 focus:outline-none border-b-2 ${activeTab === 'My work items'
                            ? 'font-semibold text-[rgba(0,120,212,1)] border-[rgba(0,120,212,1)]'
                            : 'font-normal text-black border-transparent'
                            }`}
                    >
                        My work items
                    </button>
                    <button
                        onClick={() => handleNavigation('/my-pull-requests', 'My pull requests')}
                        className={`cursor-pointer self-stretch whitespace-nowrap py-[17px] px-2 focus:outline-none border-b-2 ${activeTab === 'My pull requests'
                            ? 'font-semibold text-[rgba(0,120,212,1)] border-[rgba(0,120,212,1)]'
                            : 'font-normal text-black border-transparent'
                            }`}
                    >
                        My pull requests
                    </button>
                </div>
                {pathname === '/' && (
                    <div className="relative flex items-center w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Filter size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Filter projects by name..."
                            value={filter}
                            onChange={handleFilterChange}
                            className="w-full pl-9 pr-3 py-1.5 rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200 bg-white"
                        />
                    </div>
                )}
            </nav>
            <CreateProjectModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onProjectCreated={onProjectCreated}
            />
        </>
    );
};

export default Navbar;