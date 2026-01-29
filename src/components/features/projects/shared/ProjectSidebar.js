'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { useSelector } from 'react-redux';

export default function ProjectSidebar() {
    const { handleOpenBugIndexModal } = useModal();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedSubItem, setSelectedSubItem] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null); // Only one item expanded at a time (accordion)
    const [open, setOpen] = useState(false);
    const [isWorkItemSubmenuOpen, setIsWorkItemSubmenuOpen] = useState(false);
    const dropdownContainerRef = useRef();
    const leaveTimeoutRef = useRef(null);
    const [pinnedWorkItems, setPinnedWorkItems] = useState([]);
    const { name, projectId, description, id } = useSelector((state) => state.project);

    const WORK_ITEM_TYPES = [
        { id: 'bug', label: 'Bug' },
        { id: 'task1', label: 'Task' },
        { id: 'feature', label: 'Feature' },
        { id: 'issue', label: 'Issue' },
        { id: 'task2', label: 'Task' },
        { id: 'testcase', label: 'Test Case' },
        { id: 'userstory', label: 'User Story' },
    ];

    const navigationItems = [
        {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/9db6e8e904714d60ec90a276162694f005580e0d',
            label: 'Overview',
            subItems: ['Summary', 'Dashboard', "Wiki"],
        },
        {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/06fd8a47f2f91c04d311aab7fd0056ff6ae967f7',
            label: 'Boards',
            subItems: ['Work Items', 'Boards', 'Backlogs', 'Queries', 'Sprints', 'Delivery Plans', 'Analytics Views'],
        },
        {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/3014496f22b5529a9972e3f4c89d90133fbabf54',
            label: 'Repos',
            subItems: ['Files', 'Commits', 'Pushes', 'Branches', 'Tags', 'Releases', 'Pull Requests', 'Advance Security'],
        },
        {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/0a5e20a75b8b3e1666fed1a45cded2691fee8849',
            label: 'Pipelines',
            subItems: ['Pipelines', 'Enviorments', 'Releases', 'XAML'],
        },
        {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/81f7908f57bdf3ca358e0176e704a276c7e693d1',
            label: 'Test Plans',
            subItems: ['Test Plans', 'Progress Report', 'Runs'],
        },
        {
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6cc30d6ae3de7041689ac28682437b03714803b3',
            label: 'Artifacts',
            subItems: ['Artifacts'],
        }
    ];

    // Handle navigation item click - navigate to first sub-item and expand section (accordion style)
    const handleItemClick = (item) => {
        // Expand this item (collapse others automatically since we store only one)
        setExpandedItem(item.label);
        // Navigate to first sub-item
        const firstSubItem = item.subItems[0];
        handleSidebarNavigation(
            item.label,
            firstSubItem,
            `/${item.label.toLowerCase().replace(/\s+/g, '-')}/${firstSubItem.toLowerCase().replace(/\s+/g, '-')}`
        );
    };

    const handleSidebarNavigation = (parentLabel, subItem, subPath) => {
        // pathname is like /projects/Synxa or /projects/Synxa/overview/summary
        const pathSegments = pathname.split('/'); // ["", "projects", "Synxa", ...]
        if (pathSegments.length > 2 && pathSegments[1] === 'projects') {
            const projectBasePath = `/${pathSegments[1]}/${pathSegments[2]}`; // e.g., /projects/Synxa
            const finalPath = projectBasePath + subPath; // e.g., /projects/Synxa/boards/work-items
            router.push(finalPath);
        } else {
            console.error("Could not determine project base path from pathname:", pathname);
            router.push(subPath); // Fallback to original behavior
        }
        // Set the selected sub-item to highlight it
        setSelectedSubItem(`${parentLabel}-${subItem}`);
    };

    // Close popups when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    // Ensure submenu closes when main popup closes
    useEffect(() => {
        if (!open) {
            setIsWorkItemSubmenuOpen(false);
            clearTimeout(leaveTimeoutRef.current);
        }
    }, [open]);

    const handleWorkItemMouseEnter = () => {
        clearTimeout(leaveTimeoutRef.current);
        setIsWorkItemSubmenuOpen(true);
    };

    const handleWorkItemMouseLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setIsWorkItemSubmenuOpen(false);
        }, 200);
    };

    const handleSubmenuItemClick = (action) => {
        setOpen(false);
        if (handleOpenBugIndexModal) handleOpenBugIndexModal(action);
    };

    const handlePinWorkItem = (itemLabel) => {
        setPinnedWorkItems(prev => {
            if (!prev.includes(itemLabel)) {
                return [...prev, itemLabel];
            }
            return prev;
        });
    };

    const handleUnpinWorkItem = (itemLabel) => {
        setPinnedWorkItems(prev => prev.filter(item => item !== itemLabel));
    };

    return (
        <aside className="flex flex-col bg-[#EAEAEA] border border-black/10 relative layout-min-height">
            <header className="flex items-center h-12 px-3">
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/5d51dd1ad09f548c017def1774848bf4c280cf0c"
                    alt="Synxa Logo"
                    className="w-6 h-6 rounded"
                />
                <span className="ml-3 text-sm font-bold text-black/90">{name || "No Project Name Specified"}</span>
                {/* Container for the button and its dropdown */}
                <div ref={dropdownContainerRef} className="ml-auto relative">
                    <button
                        className="p-4 cursor-pointer"
                        onClick={() => setOpen(!open)}
                        aria-label="Add new item">
                        +
                    </button>
                    {open && (
                        <div
                            className="absolute top-0 left-full ml-2 bg-white border border-gray-300 rounded w-[200px] shadow-lg z-10"
                        >
                            <ul className="m-0 p-0 list-none">
                                <li
                                    className="relative p-2.5 cursor-pointer border-b border-gray-200 hover:bg-gray-100 flex justify-between items-center"
                                    onMouseEnter={handleWorkItemMouseEnter}
                                    onMouseLeave={handleWorkItemMouseLeave}
                                >
                                    <span>New work item</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right h-4 w-4 text-gray-500" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                                    </svg>
                                    {isWorkItemSubmenuOpen && (
                                        <div
                                            className="absolute top-0 left-full ml-px bg-white border border-gray-300 rounded w-[150px] shadow-lg z-20"
                                            onMouseEnter={handleWorkItemMouseEnter}
                                            onMouseLeave={handleWorkItemMouseLeave}
                                        >
                                            <ul className="m-0 p-0 list-none">
                                                {WORK_ITEM_TYPES.map(itemType => {
                                                    const isPinned = pinnedWorkItems.includes(itemType.label);
                                                    return (
                                                        <li key={itemType.id} className="flex items-center justify-between p-2.5 hover:bg-gray-100">
                                                            <span
                                                                className="cursor-pointer flex-grow"
                                                                onClick={() => handleSubmenuItemClick(`${itemType.label}`)}
                                                            >
                                                                {itemType.label}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!isPinned) {
                                                                        handlePinWorkItem(itemType.label);
                                                                    }
                                                                }}
                                                                className={`p-1 rounded ${isPinned ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                                                aria-label={isPinned ? `${itemType.label} is pinned` : `Pin ${itemType.label}`}
                                                                disabled={isPinned}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`bi bi-pin-angle-fill w-4 h-4 ${isPinned ? 'text-gray-400' : 'text-gray-600'}`} viewBox="0 0 16 16">
                                                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a2.7 2.7 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146" />
                                                                </svg>
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                                {pinnedWorkItems.map(pinnedItem => (
                                    <li key={pinnedItem} className="flex items-center justify-between p-2.5 border-b border-gray-200 hover:bg-gray-100">
                                        <span
                                            className="cursor-pointer flex-grow"
                                            onClick={() => handleSubmenuItemClick(`Create ${pinnedItem}`)}
                                        >
                                            {pinnedItem}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnpinWorkItem(pinnedItem);
                                            }}
                                            className="cursor-pointer p-1 rounded hover:bg-red-100"
                                            aria-label={`Unpin ${pinnedItem}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pin-angle w-4 h-4 text-red-500 hover:text-red-700" viewBox="0 0 16 16">
                                                <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6.027 6.027 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6.027 6.027 0 0 1 1.013.16l3.134-3.133a2.697 2.697 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146zm.146 3.354a.5.5 0 0 0-.708 0L6.586 6.76l-1.015.34a5.027 5.027 0 0 0-.33-.23l-.235-.158a.5.5 0 0 0-.708 0l-1.585 1.586a.5.5 0 0 0 0 .707l1.586 1.585a.5.5 0 0 0 .708 0l.158-.235a5.027 5.027 0 0 0 .23-.33l.34-1.015 2.678-2.679a.5.5 0 0 0 0-.708z" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            <div className="h-px bg-black/10 mx-2.5" />

            {/* Collapsible navigation - Azure DevOps style */}
            <nav className="flex flex-col py-1.5 flex-grow overflow-y-auto">
                {navigationItems.map((item) => {
                    const isExpanded = expandedItem === item.label;
                    const hasActiveSubItem = item.subItems.some(
                        subItem => selectedSubItem === `${item.label}-${subItem}`
                    );

                    return (
                        <div key={item.label} className={`flex flex-col ${hasActiveSubItem ? 'bg-black/5' : ''}`}>
                            {/* Parent navigation item - entire row is clickable */}
                            <div
                                className={`relative flex items-center h-10 px-3 text-left w-full select-none cursor-pointer
                                    ${hasActiveSubItem ? 'bg-black/5' : 'hover:bg-black/5'}
                                `}
                                onClick={() => handleItemClick(item)}
                            >
                                <img src={item.icon} alt={`${item.label} icon`} className="w-5 h-5 ml-1" />
                                <span className="ml-2 text-sm text-black/90 font-bold">{item.label}</span>
                                {/* Active indicator bar */}
                                {hasActiveSubItem && (
                                    <div className="absolute left-0 top-1 w-[3px] h-8 bg-[#0078D4]" />
                                )}
                            </div>

                            {/* Collapsible sub-items */}
                            <div
                                className={`overflow-hidden transition-all duration-200 ease-in-out
                                    ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                {item.subItems.map((subItem) => {
                                    const isActive = selectedSubItem === `${item.label}-${subItem}`;
                                    return (
                                        <div
                                            key={subItem}
                                            className={`relative flex items-center h-9 pl-12 pr-3 cursor-pointer
                                                ${isActive ? 'bg-[#0078D4]/10 text-[#0078D4]' : 'text-black/80 hover:bg-black/5 hover:text-black'}
                                            `}
                                            onClick={() => handleSidebarNavigation(
                                                item.label,
                                                subItem,
                                                `/${item.label.toLowerCase().replace(/\s+/g, '-')}/${subItem.toLowerCase().replace(/\s+/g, '-')}`
                                            )}
                                        >
                                            <span className={`text-sm ${isActive ? 'text-[#0078D4] font-bold' : ''}`}>{subItem}</span>
                                            {/* Active sub-item indicator */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1 w-[3px] h-7 bg-[#0078D4]" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            <footer className="mt-auto">
                <div className="h-px bg-black/10 mx-2.5" />
                <div className="flex items-center">
                    <button className="flex items-center h-12 w-full px-4" aria-label="Project settings">
                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none">
                            <path
                                d="M8.5 5.984a2.016 2.016 0 1 0 0 4.032 2.016 2.016 0 0 0 0-4.032Zm0 2.992a.976.976 0 1 1 0-1.952.976.976 0 0 1 0 1.952ZM13.13 5.848a5.478 5.478 0 0 0-.36-.848l.712-.712a.25.25 0 0 0 0-.354l-.708-.708a.25.25 0 0 0-.354 0l-.712.712a5.515 5.515 0 0 0-.848-.36V2.25a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25v1.14a5.485 5.485 0 0 0-.848.36l-.712-.712a.25.25 0 0 0-.354 0l-.708.708a.25.25 0 0 0 0 .354l.712.712a5.515 5.515 0 0 0-.36.848H4.75a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.14c.08.295.198.57.36.848l-.712.712a.25.25 0 0 0 0 .354l.708.708a.25.25 0 0 0 .354 0l.712-.712c.278.162.553.28.848.36v1.14a.25.25 0 0 0 .25.25h1a.25.25 0 0 0 .25-.25v-1.14c.295-.08.57-.198.848-.36l.712.712a.25.25 0 0 0 .354 0l.708-.708a.25.25 0 0 0-.001-.353l-.711-.712a5.478 5.478 0 0 0 .36-.848h1.14a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.14Z"
                                fill="black"
                                fillOpacity="0.9"
                            />
                        </svg>
                        <span className="ml-3 text-sm text-black/90">Project settings</span>
                    </button>
                </div>
            </footer>
        </aside>
    );
}
