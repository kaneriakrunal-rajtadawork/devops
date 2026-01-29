import React from 'react';
import Dropdown from '@/utils/Dropdown';
import { STATES } from '@/constants/common.constants';
import { usePathname } from 'next/navigation';

export const BugDetails = ({
    state, onStateChange,
    reason, onReasonChange,
    area, onAreaChange,
    iteration, onIterationChange,
    areaOptions = [],
    iterationOptions = [],
    stateOptions = Object.values(STATES).map((state) => ({ label: state })),
    reasonOptions = [
        { label: 'Added To Backlog' },
        { label: 'Started' },
        { label: 'Completed' },
        { label: 'Cut' },
        { label: 'Deferred' },
        { label: 'Obsolete' }
    ],
}) => {
    const pathName = usePathname();
    const isCreateMode = pathName.includes('/create');

    // Filter state options - only "To Do" when creating new work item
    const filteredStateOptions = isCreateMode
        ? [{ label: 'To Do' }]
        : stateOptions;

    // Filter reason options - only "Added To Backlog" when creating new work item
    const filteredReasonOptions = isCreateMode
        ? [{ label: 'Added To Backlog' }]
        : reasonOptions;

    return (
        <div className="flex flex-row py-2 bg-gray-100">
            {/* Left Section - Less Width */}
            <div className="flex flex-row flex-wrap flex-[1]">
                {/* State Dropdown */}
                <div className="flex flex-col pl-8 w-full mb-4">
                    <div className="flex items-center">
                        <label htmlFor="state" className="text-sm text-gray-600 pr-4">State</label>
                        <div className="relative w-full">
                            <Dropdown
                                options={filteredStateOptions}
                                initialValue={isCreateMode ? 'To Do' : (typeof state === 'object' ? state?.label : state) || 'New'}
                                onSelect={onStateChange}
                                className="w-full"
                                alignRight={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Reason Dropdown */}
                <div className="flex flex-col pl-8 w-full">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 pr-4">Reason</span>
                        <div className="relative w-full">
                            <Dropdown
                                options={filteredReasonOptions}
                                initialValue={isCreateMode ? 'Added To Backlog' : (typeof reason === 'object' ? reason?.label : reason) || 'New'}
                                onSelect={onReasonChange}
                                className="w-full"
                                alignRight={false}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - More Width */}
            <div className="flex flex-col flex-[2] pl-8">
                {/* Area Dropdown */}
                <div className="flex items-center mb-4">
                    <label htmlFor="area" className="text-sm text-gray-600 pr-4 w-24">
                        <span className="underline">A</span>rea
                    </label>
                    <div className="relative w-full">
                        <Dropdown
                            options={areaOptions}
                            initialValue={typeof area === 'object' ? area?.label : (area || areaOptions?.[0]?.label)}
                            onSelect={onAreaChange}
                            className="w-full"
                            alignRight={false}
                        />
                    </div>
                </div>

                {/* Iteration Dropdown */}
                <div className="flex items-center">
                    <label htmlFor="iteration" className="text-sm text-gray-600 pr-4 w-24">
                        Ite<span className="underline">r</span>ation
                    </label>
                    <div className="relative w-full">
                        <Dropdown
                            options={iterationOptions}
                            initialValue={typeof iteration === 'object' ? iteration?.label : iteration}
                            onSelect={onIterationChange}
                            className="w-full"
                            alignRight={false}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs Section - Unchanged */}
            <div className="flex pl-8 items-end mr-2">
                <div className="text-sm text-gray-500 h-5" aria-live="polite" aria-atomic="true"></div>
                <div className="sticky top-0 flex justify-end w-full border-t border-gray-200">
                    <div role="tablist" className="flex text-sm">
                        <button className="border border-[rgba(218,218,218,1)] px-4 py-2 border-b border-b-blue-500 text-blue-600 font-medium" role="tab" aria-selected="true">Details</button>
                        <button className="border border-[rgba(218,218,218,1)] px-4 py-2 text-gray-500" role="tab" aria-selected="false">🕘</button>
                        <button className="border border-[rgba(218,218,218,1)] px-4 py-2 text-gray-500" role="tab" aria-selected="false">
                            🔗<span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">0</span>
                        </button>
                        <button className="border border-[rgba(218,218,218,1)] px-4 py-2 text-gray-500" role="tab" aria-selected="false">
                            📎<span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">0</span>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};