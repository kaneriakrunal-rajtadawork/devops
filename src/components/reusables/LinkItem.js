'use client';

import React from 'react';

/**
 * LinkItem - Styled link component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Link text
 * @param {string} props.href - Link URL
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const LinkItem = ({
    children,
    href = '#',
    className = '',
    onClick,
}) => {
    return (
        <a
            href={href}
            onClick={onClick}
            className={`text-sky-700 underline hover:text-sky-800 ${className}`}
        >
            {children}
        </a>
    );
};

export default LinkItem;
