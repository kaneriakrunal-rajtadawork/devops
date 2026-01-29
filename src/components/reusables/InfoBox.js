'use client';

import React from 'react';

/**
 * InfoBox - Container for informational content with gray background
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content
 * @param {string} props.className - Additional CSS classes
 */
const InfoBox = ({ children, className = '' }) => {
    return (
        <section className={`bg-zinc-100 rounded ${className}`}>
            {children}
        </section>
    );
};

export default InfoBox;
