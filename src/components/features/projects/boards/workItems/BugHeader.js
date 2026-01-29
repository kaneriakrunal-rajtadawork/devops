import React, { useState, useEffect } from 'react';
import MembersList from "../components/MembersList";
import TagInput from "@/components/reusables/TagInput";
import { Save } from 'lucide-react';
import Button from '@/components/reusables/Button';
import { WORKITEMTYPE_COLORS } from '@/constants/common.constants';

export const BugHeader = ({ actionType, onClose, title, onTitleChange, onSave, isSaveDisabled, handleChange, repoId, onMemberSelect, assignedMember, isEditMode, workItemId, workItemNumber, workItemTags, workItemCommentsLength, isLoading }) => {
    const [tags, setTags] = useState([]);

    // Sync tags when workItemTags prop changes (e.g., after async fetch)
    useEffect(() => {
        if (Array.isArray(workItemTags) && workItemTags.length > 0) {
            setTags(workItemTags);
        }
    }, [workItemTags]);

    const handleTagsChange = (updatedTags) => {
        setTags(updatedTags);
        handleChange(updatedTags);
    };
    const leftBorderColor = WORKITEMTYPE_COLORS[actionType?.toLowerCase()];

    return (
        <section
            className="px-2 pb-2 border-l-[10px]"
            style={{ borderLeftColor: leftBorderColor }}
        >
            <div className=" w-full max-md:max-w-full">
                <div className="flex flex-wrap gap-5 justify-between ml-3 max-md:max-w-full">
                    <div className="flex gap-2.5 my-auto">
                        <p className="grow text-xs text-black">
                            {isEditMode ? `${actionType?.toUpperCase()} #${workItemNumber || ''}` : `NEW ${actionType?.toUpperCase()} *`}
                        </p>
                        {!title && (
                            <div className="flex gap-1 text-sm text-red-700">
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/0488da7d73e9e75828e46e33af60aeeca43483b1?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260"
                                    alt="Error icon"
                                    className="object-contain shrink-0 self-start w-3.5 aspect-[0.93]"
                                />
                                <p className="basis-auto">Field <i>Title</i> cannot be empty.</p>
                            </div>
                        )}
                    </div>
                    <div className="flex">
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/ef2b88b979f445bfd4c1677e6adb16e31beae9fb?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260"
                            alt="Action icon"
                            className="object-contain shrink-0 rounded-sm aspect-square w-[34px]"
                        />
                        {onClose && (
                            <img
                                onClick={onClose}
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/977c34c1234fa1dbde5793b41f6d60b5878257a5?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260"
                                alt="Action icon"
                                className="cursor-pointer object-contain shrink-0 rounded-sm aspect-square w-[34px]"
                            />
                        )}
                    </div>
                </div>
                <div className="flex overflow-hidden flex-col justify-center p-px mt-1 text-lg text-black bg-white rounded-sm max-md:mr-1 max-md:max-w-full">
                    <input
                        type="text"
                        placeholder="Enter title"
                        value={title}
                        onChange={e => onTitleChange(e.target.value)}
                        className="overflow-hidden px-3 py-2 bg-white border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm transition-colors duration-200 outline-none max-md:pr-5 max-md:max-w-full"
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-5 justify-between mt-1 w-full max-md:mr-0.5 max-md:max-w-full">
                <div className="flex gap-2 text-sm text-black max-md:max-w-full">
                    <MembersList
                        repoId={repoId}
                        onMemberSelect={onMemberSelect}
                        selectedMember={assignedMember}
                    />
                    <div className="flex gap-1 my-auto text-sky-700">
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/679ed26abed37001ae6b83954a41bc9795d21d46?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260"
                            alt="Comments icon"
                            className="object-contain shrink-0 self-start w-3.5 aspect-[0.93]"
                        />
                        <span>{workItemCommentsLength || 0} Comment{workItemCommentsLength === 1 ? '' : 's'}</span>
                    </div>
                    <div className="max-w-xl">
                        <TagInput
                            tags={tags}
                            onTagsChange={handleTagsChange}
                            placeholder="Enter tag"
                            addButtonText="Add Tag"
                        />
                    </div>
                </div>
                <div className="flex gap-2.5 my-auto">
                    <div className={`flex self-start text-sm font-semibold text-center ${isSaveDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}>
                        <Button type='button' onClick={onSave} loading={isLoading} disabled={isSaveDisabled}>
                            <Save className="w-4 h-4 my-auto mr-2" />
                            <span>{isEditMode ? (isLoading ? 'Updating' : 'Update') : 'Save'}</span>
                        </Button>

                        {/* <div className="flex shrink-0 w-px bg-black bg-opacity-10 h-[33px]" />
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6207cfa98882f92a9745ba7e32ebcdaccb52f7b0?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260"
                            alt="Additional options"
                            className={`object-contain shrink-0 rounded-none aspect-[0.91] w-[30px]  ${isSaveDisabled ? " invert brightness-1" : "grayscale"}`}
                        /> */}
                    </div>
                    <div className="flex gap-2.5">
                        <IconButton alt="Refresh" imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/200201776f5913efb0118d42f50bbede7e0ce075?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260" />
                        <IconButton alt="Revert Changes" imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/d8432c445f63ec145bc081b3375977bfea170e0e?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260" />
                        <IconButton alt="More Action" imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/c4fb6806b0739d87a6d82fb2ba903a5073f90b8e?placeholderIfAbsent=true&apiKey=d972d63ac9304cd18e3dadf3a1c49260" />
                    </div>
                </div>
            </div>
        </section>
    );
};




export const IconButton = ({ imageUrl, alt = "Action icon" }) => {
    return (
        <img
            src={imageUrl}
            alt={alt}
            title={alt}
            className="object-contain shrink-0 rounded-sm aspect-square w-[34px]"
        />
    );
};