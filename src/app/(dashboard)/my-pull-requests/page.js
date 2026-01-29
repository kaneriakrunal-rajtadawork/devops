import React from 'react';
import Navbar from '@/components/layout/Navbar';

const MyPullRequestsPage = () => {
    return (
        <div className="bg-[rgba(248,248,248,1)] flex w-full flex-col overflow-hidden items-stretch mx-auto pt-6 max-md:max-w-full">
            <Navbar />
            {/* <div className="px-8 h-[450px] flex flex-wrap gap-x-8 gap-y-8"> */}
            <div className="px-8 h-[450px] flex flex-wrap justify-center items-center gap-x-8 gap-y-8">
                <article className="flex flex-col items-center pb-2 text-sm text-center max-w-[446px]">
                    <img
                        src="../_assets/image/no-pull-requests.png" // Replace with your image URL
                        alt="No pull requests illustration"
                        className="object-contain max-w-full aspect-[1.34] w-[214px]"
                    />
                    <h1 className="self-stretch mt-4 w-full text-3xl font-bold tracking-tighter text-black">
                        Currently, no pull requests need your attention
                    </h1>
                    <p className="mt-8 text-black">
                        Pull requests allow you to review code and help ensure quality before merge. 
                        <a
                            href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests" // Replace with your desired URL
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 underline hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                            aria-label="Learn more about pull requests"
                        >
                             Learn more
                        </a>
                    </p>
                </article>
            </div>
        </div>
    );
};

export default MyPullRequestsPage;