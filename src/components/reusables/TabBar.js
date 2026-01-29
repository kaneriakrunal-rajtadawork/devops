'use client';

import React from 'react';
import clsx from 'clsx';

/**
 * TabBar - A generic, reusable tab navigation component
 * 
 * @example
 * <TabBar
 *   tabs={[
 *     { id: 'board', label: 'Board' },
 *     { id: 'analytics', label: 'Analytics' },
 *   ]}
 *   activeTab="board"
 *   onTabChange={(tabId) => setActiveTab(tabId)}
 * />
 */
const TabBar = ({
    tabs = [],
    activeTab,
    onTabChange,
    className = '',
    tabClassName = '',
    activeClassName = 'text-blue-600 border-b-2 border-blue-600',
    inactiveClassName = 'text-gray-600 hover:text-gray-800',
    children, // Optional: render additional content on the right side
}) => {
    return (
        <div className={clsx('flex items-center justify-between', className)}>
            <div className="flex items-center w-full">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={clsx(
                                'px-4 py-3 text-sm font-medium cursor-pointer',
                                tabClassName,
                                activeTab === tab.id ? activeClassName : inactiveClassName
                            )}
                        >
                            {tab.icon && <span className="mr-2">{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right side content (additional controls) */}
                {children && (
                    <div className="flex items-center ml-auto">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabBar;
