// src/app/projects/[ProjectName]/[Menu]/[SubMenu]/NewViewModal.js
"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings, ListChecks, Columns, History, CheckSquare } from 'lucide-react';

const modalTabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'workitems', label: 'Work Items', icon: <ListChecks size={18} /> },
    { id: 'field', label: 'Field', icon: <Columns size={18} /> },
    { id: 'history', label: 'History', icon: <History size={18} /> },
    { id: 'verification', label: 'Verification', icon: <CheckSquare size={18} /> },
];

const NewViewModal = ({ isOpen, onClose }) => {
    const [activeModalTab, setActiveModalTab] = useState('general');
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsAnimatingOut(false);
        } else if (isVisible) {
            setIsAnimatingOut(true);
            // Wait for animation to finish before setting isVisible to false
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, isVisible]);

    if (!isVisible && !isAnimatingOut) {
        return null;
    }

    const handleClose = () => {
        setIsAnimatingOut(true);
        const timer = setTimeout(() => {
            onClose();
            setIsVisible(false); // Ensure visibility is reset
        }, 300); // Match animation duration
        return () => clearTimeout(timer);
    };
    
    const renderTabContent = () => {
        // Basic transition example
        const contentClass = "p-6 transition-opacity duration-300 ease-in-out";
        switch (activeModalTab) {
            case 'general':
                return <div className={contentClass}>General Settings Content: Configure name, description, and sharing options.</div>;
            case 'workitems':
                return <div className={contentClass}>Work Items Filters: Define criteria for work items to include.</div>;
            case 'field':
                return <div className={contentClass}>Field Selection: Choose which fields to display in the view.</div>;
            case 'history':
                return <div className={contentClass}>History Configuration: Set parameters for historical data.</div>;
            case 'verification':
                return <div className={contentClass}>Verification Steps: Review and verify the view configuration.</div>;
            default:
                return <div className={contentClass}>Select a tab</div>;
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isOpen && !isAnimatingOut ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`fixed bottom-0 right-0 h-[calc(100vh-4rem)] max-h-[700px] w-full max-w-3xl bg-white shadow-2xl rounded-tl-lg z-50 flex flex-col
                            transform transition-all duration-300 ease-in-out
                            ${isOpen && !isAnimatingOut ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Analytics View</h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <nav className="w-1/4 min-w-[180px] bg-gray-50 border-r border-gray-200 p-4 space-y-1 overflow-y-auto">
                        {modalTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveModalTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                                            ${activeModalTab === tab.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                            }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Right Content Area */}
                    <div className="flex-1 p-1 overflow-y-auto bg-white">
                        {/* Animated content switching can be enhanced here */}
                        {renderTabContent()}
                    </div>
                </div>
                 {/* Modal Footer (Optional) */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button 
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button 
                        // onClick={handleSave} // Implement save logic
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Create View
                    </button>
                </div>
            </div>
        </>
    );
};

export default NewViewModal;
