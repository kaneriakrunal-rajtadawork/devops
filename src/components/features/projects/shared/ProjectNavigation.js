// src/components/features/projects/shared/ProjectNavigation.js
"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const ProjectNavigation = ({ projectName, currentMenu, currentSubmenu }) => {
    const router = useRouter();
    const pathname = usePathname();

    const navigateToMenu = (menu, submenu = null) => {
        const menuPath = menu.charAt(0).toUpperCase() + menu.slice(1);
        if (submenu) {
            const submenuPath = submenu.charAt(0).toUpperCase() + submenu.slice(1);
            router.push(`/projects/${projectName}/${menuPath}/${submenuPath}`);
        } else {
            router.push(`/projects/${projectName}/${menuPath}`);
        }
    };

    const menus = [
        {
            name: 'repos',
            label: 'Repos',
            submenus: ['files', 'branches', 'pull-requests']
        },
        {
            name: 'boards',
            label: 'Boards', 
            submenus: ['work-items', 'backlogs', 'sprints']
        },
        {
            name: 'pipelines',
            label: 'Pipelines',
            submenus: ['builds', 'releases']
        }
    ];

    const currentMenuData = menus.find(menu => menu.name === currentMenu);

    return (
        <div className="project-navigation bg-white border-b">
            {/* Main Menu Navigation */}
            <div className="px-6 border-b">
                <nav className="flex space-x-8">
                    {menus.map((menu) => (
                        <button
                            key={menu.name}
                            onClick={() => navigateToMenu(menu.name, menu.submenus[0])}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                                currentMenu === menu.name
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            {menu.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Submenu Navigation */}
            {currentMenuData && (
                <div className="px-6">
                    <nav className="flex space-x-6">
                        {currentMenuData.submenus.map((submenu) => (
                            <button
                                key={submenu}
                                onClick={() => navigateToMenu(currentMenu, submenu)}
                                className={`py-3 px-2 text-sm border-b-2 transition-colors ${
                                    currentSubmenu === submenu
                                        ? 'border-blue-600 text-blue-600 font-medium'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {submenu.charAt(0).toUpperCase() + submenu.slice(1).replace('-', ' ')}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
};

export default ProjectNavigation;