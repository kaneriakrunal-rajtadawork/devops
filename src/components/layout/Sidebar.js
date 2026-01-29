import React from 'react';
import { useModal } from '@/context/ModalContext';

const Sidebar = () => {
    const { handleOpenBugIndexModal } = useModal();
    
    return (
        <div className="bg-white w-full text-sm font-normal flex flex-col min-h-[94vh] h-full">
            {/* Organization Info Section with top padding and consistent horizontal padding */}
            <div className="pt-[21px] pl-3 pr-[52px] max-md:pr-5">
                <div className="bg-[rgba(222,236,249,1)] flex items-center gap-[9px] text-black whitespace-nowrap rounded-sm">
                    <div className="bg-[rgba(0,120,212,1)] self-stretch flex w-[3px] shrink-0 h-10" />
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/8f146047d7e6c05af0463de569f3568dd2cd76b1?placeholderIfAbsent=true"
                        alt="Organization Avatar"
                        className="aspect-[1] object-contain w-6 rounded self-stretch shrink-0 my-auto"
                    />
                    <div className="self-stretch grow shrink basis-0 my-auto">
                        Synxa Organization
                    </div>
                </div>
            </div>
            {/* "New organization" button and "Organization settings" */}
            {/* This div will grow and push the settings to the bottom */}
            <div className="flex w-full flex-col flex-grow leading-none mt-[19px] pl-3 pr-[52px] pb-[21px] max-md:pr-5">
                <button className="text-[rgba(0,90,158,1)] underline text-left">
                    New organization
                </button>
                {/* Organization settings pushed to the bottom */}
                <div className="flex items-stretch gap-1.5 text-black mt-auto max-md:mt-10">
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/5ef4dcc3d3c233e04355b65c8e251b3b935fe4d6?placeholderIfAbsent=true"
                        alt="Settings Icon"
                        className="aspect-[1] object-contain w-4 shrink-0"
                    />
                    <div className="basis-auto">Organization settings</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
