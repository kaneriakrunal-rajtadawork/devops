'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * CollapsibleSection - Reusable expandable/collapsible section
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {boolean} props.defaultExpanded - Initial expanded state
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.className - Additional CSS classes for container
 * @param {string} props.titleClassName - Additional CSS classes for title
 */
const CollapsibleSection = ({
    title,
    defaultExpanded = true,
    children,
    className = '',
    titleClassName = '',
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpand = () => setIsExpanded((prev) => !prev);

    return (
        <div className={`p-4 rounded-md shadow-sm bg-white ${className}`}>
            <div
                className="flex justify-between items-center cursor-pointer mb-4"
                role="button"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
            >
                <h2 className={`text-lg font-semibold ${titleClassName}`}>{title}</h2>

                <button
                    className="cursor-pointer text-gray-500 hover:text-black"
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
                >
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </button>
            </div>

            {isExpanded && children}
        </div>
    );
};

export default CollapsibleSection;
