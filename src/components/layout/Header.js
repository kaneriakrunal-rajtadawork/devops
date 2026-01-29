"use client";
import React, { useEffect, useMemo } from 'react';
import Menubar from '../../component/Menubar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/authSlice';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { setRepo, setIsRepoAvailable } from '@/store/repoSlice';
import { useGetApiRepos } from '@/api-client';
import Tooltip from '../ui/Tooltip';

// Sections that require repo selection (lowercase for comparison)
const REPO_REQUIRED_SECTIONS = ['repos', 'boards'];

const Header = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const project = useSelector((state) => state.project);
    const { selectedRepo } = useSelector((state) => state.repo);
    const [repoDropdownOpen, setRepoDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/signin');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setRepoDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Use Orval-generated hook for fetching repositories
    const {
        data: reposResponse,
        isLoading: reposLoading,
        error: reposError
    } = useGetApiRepos(
        { projectId: project?.id },
        { query: { enabled: !!project?.id } }
    );

    // Extract repos from API response
    const repos = reposResponse?.data?.data || [];

    useEffect(() => {
        if (repos.length === 0) {
            dispatch(setIsRepoAvailable(false));
        } else {
            dispatch(setIsRepoAvailable(true));
        }
    }, [repos, dispatch]);

    const onRepoSelect = (repo) => {
        dispatch(setRepo(repo));
        setRepoDropdownOpen(false);
    };

    // Parse path segments
    const pathSegments = useMemo(() => {
        if (!pathname.startsWith('/projects/') || pathname === '/projects') {
            return [];
        }
        return pathname.split('/').filter(segment => segment);
    }, [pathname]);

    // Check if current section requires repo selection (case-insensitive)
    const currentSection = pathSegments[2]?.toLowerCase(); // e.g., 'repos', 'boards', 'overview'
    const requiresRepoSelection = REPO_REQUIRED_SECTIONS.includes(currentSection);

    // Build breadcrumb items
    const breadcrumbItems = useMemo(() => {
        if (pathSegments.length === 0) return [];

        const items = [];
        let currentPath = '';
        let repoSelectorShown = false; // Track if we've already shown the repo selector

        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isProjectsRoot = segment.toLowerCase() === 'projects';
            const isRepoSection = REPO_REQUIRED_SECTIONS.includes(segment.toLowerCase());

            // Only mark as repo section if we haven't shown the selector yet
            const shouldShowRepoSelector = isRepoSection && !repoSelectorShown;
            if (shouldShowRepoSelector) {
                repoSelectorShown = true;
            }

            items.push({
                label: decodeURIComponent(segment).charAt(0).toUpperCase() + decodeURIComponent(segment).slice(1),
                path: isProjectsRoot ? '/projects' : currentPath,
                isRepoSection: shouldShowRepoSelector, // Only true for first occurrence
                isLast: index === pathSegments.length - 1,
                segment
            });
        });

        return items;
    }, [pathSegments]);

    // Repo selector dropdown component
    const RepoSelectorDropdown = () => (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
                disabled={reposLoading || repos.length === 0}
                className={`
                    flex items-center gap-1 px-2 py-1 rounded text-sm font-medium
                    transition-colors duration-150
                    ${reposLoading || repos.length === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[rgba(0,120,212,1)] hover:bg-blue-50'
                    }
                `}
            >
                <Tooltip title={selectedRepo?.name} placement="bottom">
                    <span className="max-w-[150px] truncate">
                        {reposLoading
                            ? 'Loading...'
                            : reposError
                                ? 'Error'
                                : repos.length === 0
                                    ? 'No repos'
                                    : selectedRepo?.name || 'Select Repository'
                        }
                    </span>
                </Tooltip>
                <ChevronDown className={`w-4 h-4 transition-transform ${repoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {repoDropdownOpen && repos.length > 0 && (
                <div className="absolute top-full left-0 mt-1 min-w-[200px] max-w-[300px] bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-[300px] overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2">
                            Repositories
                        </div>
                    </div>
                    {repos.map((repo) => (
                        <button
                            key={repo.githubRepoId || repo._id}
                            onClick={() => onRepoSelect(repo)}
                            className={`
                                w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors
                                flex items-center gap-2
                                ${selectedRepo?.githubRepoId === repo.githubRepoId ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                            `}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z" />
                            </svg>
                            <span className="truncate">{repo.name}</span>
                            {selectedRepo?.githubRepoId === repo.githubRepoId && (
                                <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex items-stretch text-sm flex-wrap">
            <div className="bg-white shadow-[0px_1px_0px_rgba(0,0,0,0.08)] flex items-stretch flex-wrap grow shrink basis-auto px-[13px] py-2 max-md:max-w-full">
                <div className="flex items-center gap-2 text-[rgba(0,120,212,1)] font-bold my-auto">
                    {/* Logo */}
                    <Link href={`/`} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/ff1de8aa9f188e669f08eacacd2f084e032ed874?placeholderIfAbsent=true"
                            alt="Azure DevOps Logo"
                            className="aspect-[0.95] object-contain w-[21px] shrink-0"
                        />
                        <span className="font-bold">SYNXA</span>
                    </Link>

                    {/* Breadcrumb Navigation */}
                    {breadcrumbItems.length > 0 && (
                        <nav className="flex items-center" aria-label="Breadcrumb">
                            {breadcrumbItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    {/* Separator */}
                                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />

                                    {/* Breadcrumb Item */}
                                    {item.isRepoSection ? (
                                        // For Repos/Boards sections, show the section name then repo dropdown
                                        <div className="flex items-center">
                                            <Link
                                                href={item.path}
                                                className="text-sm font-medium text-[rgba(0,120,212,1)] hover:underline"
                                            >
                                                {item.label}
                                            </Link>

                                            {/* Add repo dropdown after section name */}
                                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                            <RepoSelectorDropdown />
                                        </div>
                                    ) : (
                                        // Regular breadcrumb link
                                        <Link
                                            href={item.path}
                                            className={`
                                                text-sm font-medium transition-colors
                                                ${item.isLast
                                                    ? 'text-gray-900'
                                                    : 'text-[rgba(0,120,212,1)] hover:underline'
                                                }
                                            `}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}

                            {/* Show repo dropdown after last item if in repo-required section but not on a repo section itself */}
                            {requiresRepoSelection && !breadcrumbItems.some(item => item.isRepoSection) && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                    <RepoSelectorDropdown />
                                </>
                            )}
                        </nav>
                    )}
                </div>

                {/* Search Box */}
                <div className="border flex w-[200px] items-stretch gap-2.5 text-black font-normal whitespace-nowrap p-2 rounded-sm border-[rgba(102,102,102,1)] border-solid ml-auto">
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/01904915b8d239f398d62c196158d9674f3ad6d5?placeholderIfAbsent=true"
                        alt="Search Icon"
                        className="aspect-[0.87] object-contain w-3.5 shrink-0"
                    />
                    <div className="basis-auto">Search</div>
                </div>
            </div>

            <Menubar />

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
                <span>Welcome, {user?.name || 'Guest'}</span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Header;
