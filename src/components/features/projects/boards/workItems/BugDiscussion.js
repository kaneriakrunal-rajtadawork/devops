import React from 'react';

export const BugDiscussion = () => {
    return (
        <div className="font-normal max-md:max-w-full">
            <div className="text-base text-black font-semibold whitespace-nowrap mt-[43px] pb-[23px] max-md:max-w-full max-md:mt-10 max-md:pr-5">
                Discussion
            </div>
            <div className="bg-white shadow-[0px_3px_7px_rgba(0,0,0,0.133)] flex w-full flex-col items-stretch mt-4 px-6 py-[27px] rounded-[5px] max-md:max-w-full max-md:pl-5">
                <div className="flex gap-3 text-sm text-black flex-wrap">
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/d972d63ac9304cd18e3dadf3a1c49260/a7ad2629122dfaa4597f59f35b45be706e8f684b?placeholderIfAbsent=true"
                        className="aspect-[1] object-contain w-6 shrink-0 rounded-xl"
                        alt="User avatar"
                    />
                    <div className="border flex flex-col overflow-hidden items-stretch justify-center grow shrink-0 basis-0 w-fit p-0.5 rounded-[5px] border-[rgba(234,234,234,1)] border-solid max-md:max-w-full">
                        <textarea
                            className="bg-white overflow-hidden pt-1 pb-[72px] px-[7px] max-md:max-w-full resize-none"
                            placeholder="Add a comment. Use # to link a work item, @ to mention a person, or ! to link a pull request."
                        />
                    </div>
                </div>
                <div className="text-[rgba(0,90,158,1)] text-[11px] text-right underline">
                    switch to Markdown editor
                </div>
            </div>
        </div>
    );
};