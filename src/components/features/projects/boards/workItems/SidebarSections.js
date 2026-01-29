'use client';

import React from 'react';
import InfoBox from '@/components/reusables/InfoBox';
import LinkItem from '@/components/reusables/LinkItem';

/**
 * DeploymentSection - Displays deployment info and links
 */
export const DeploymentSection = () => {
    return (
        <section>
            <h2 className="w-full font-semibold text-black whitespace-nowrap">
                Deployment
            </h2>
            <InfoBox className="self-center py-3.5 mt-1 text-sm">
                <div className="flex flex-col px-5 py-px w-full">
                    <div className="flex gap-4 z-10 self-start text-black">
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/bd86a6bbaa562ce8e739b834027e85b2ea6655f5?placeholderIfAbsent=true&apiKey=e8b1e070fee542e49f0c6c69e2f819f2"
                            alt=""
                            className="object-contain shrink-0 my-auto aspect-square w-[30px]"
                        />
                        <p>
                            To track releases associated with this work item, go to Releases and turn on deployment status reporting for Boards in your pipeline Options menu.
                            <LinkItem>
                                Learn more about deployment status reporting
                            </LinkItem>
                        </p>
                    </div>
                </div>
            </InfoBox>
        </section>
    );
};

/**
 * DevelopmentSection - Displays development links
 */
export const DevelopmentSection = () => {
    return (
        <section>
            <h2 className="w-full font-semibold text-black whitespace-nowrap">
                Development
            </h2>
            <div className="flex flex-col px-2 mt-3 w-full text-sm">
                <h3 className="self-start ml-3.5 font-semibold text-center text-black">
                    Add link
                </h3>
                <InfoBox className="flex gap-2.5 py-3.5 px-2.5">
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c8cd72843b440cee6c3a0a4bfe1e0a46a2b64b93?placeholderIfAbsent=true&apiKey=e8b1e070fee542e49f0c6c69e2f819f2"
                        alt=""
                        className="object-contain shrink-0 my-auto aspect-square w-[30px]"
                    />
                    <div className="flex flex-col">
                        <p className="text-black">
                            Link an Azure Repos <LinkItem>commit</LinkItem>, <LinkItem>pull request</LinkItem>, or <LinkItem>branch</LinkItem> to see the status of your development. You can also <LinkItem>create a branch</LinkItem> to get started.
                        </p>
                    </div>
                </InfoBox>
            </div>
        </section>
    );
};

/**
 * RelatedWorkSection - Displays related work links
 */
export const RelatedWorkSection = () => {
    return (
        <section>
            <h2 className="w-full font-semibold text-black whitespace-nowrap">
                Related Work
            </h2>
            <div className="flex flex-col px-2 mt-3 w-full text-sm">
                <div className="flex gap-2.5 self-start ml-3.5 font-semibold text-center text-black">
                    <h3>Add link</h3>
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/a732d2ee394f2261c0f69aee1569552d97eff075?placeholderIfAbsent=true&apiKey=e8b1e070fee542e49f0c6c69e2f819f2"
                        alt=""
                        className="object-contain shrink-0 self-start mt-1 w-3 aspect-square"
                    />
                </div>
                <InfoBox className="px-2.5 py-3.5 mt-2.5">
                    <LinkItem>Add an existing work item as a parent</LinkItem>
                </InfoBox>
            </div>
        </section>
    );
};

/**
 * SidebarSections - Combined sidebar sections
 */
const SidebarSections = () => {
    return (
        <>
            <DeploymentSection />
            <DevelopmentSection />
            <RelatedWorkSection />
        </>
    );
};

export default SidebarSections;
