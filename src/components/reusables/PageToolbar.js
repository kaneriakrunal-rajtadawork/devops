'use client';

import React from 'react';
import clsx from 'clsx';

/**
 * PageToolbar - A generic page toolbar with left and right sections
 * 
 * @example
 * <PageToolbar
 *   left={
 *     <>
 *       <Dropdown options={teams} />
 *       <IconButton icon="☆" />
 *     </>
 *   }
 *   right={
 *     <button>View as Backlog</button>
 *   }
 * />
 */
const PageToolbar = ({
    left,
    right,
    className = '',
    leftClassName = '',
    rightClassName = '',
}) => {
    return (
        <div className={clsx('py-4', className)}>
            <div className="flex items-center justify-between">
                {/* Left section */}
                <div className={clsx('flex items-center', leftClassName)}>
                    {left}
                </div>

                {/* Right section */}
                <div className={clsx('flex items-center space-x-2', rightClassName)}>
                    {right}
                </div>
            </div>
        </div>
    );
};

export default PageToolbar;
