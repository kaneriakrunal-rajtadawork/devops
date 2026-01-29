'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { CornerUpLeftIcon } from 'lucide-react';
import Divider from '@mui/material/Divider';
import { CircularProgress } from '@mui/material';
import Link from 'next/link';

// API hooks
import { useCreateWorkItem, useGetWorkItemById, getWorkItemById, useGetWorkItemComments, useCreateWorkItemComment, useUpdateWorkItemComment, useDeleteWorkItemComment, useAddCommentReaction, getGetWorkItemCommentsQueryKey, useUpdateWorkItem, getGetWorkItemByIdQueryKey, getGetWorkItemsListMutationOptions } from "@/api-client";
import { showError } from '@/utils/toast';

// Reusable components
import CollapsibleSection from '@/components/reusables/CollapsibleSection';
import TextEditor from '@/components/reusables/TextEditor';

// Feature components
import { BugDetails } from './BugDetails';
import { BugHeader } from './BugHeader';
import { CommentItem } from './CommentItem';
import PlanningPanel from './PlanningPanel';
import SidebarSections from './SidebarSections';
import Button from '@/components/reusables/Button';
import { usePathname, useRouter } from 'next/navigation';
import { WORKITEM_PAGE_TYPE } from '@/constants/common.constants';
import { commentKeys, workItemKeys } from '@/constants/queryKeys';

const CreateWorkItem = ({ onClose, actionType, workItemId, parentId, type = WORKITEM_PAGE_TYPE.PAGE, onCreateWorkItemSuccess, onUpdateWorkItemSuccess }) => {
    // Determine if we're in edit mode
    const isEditMode = !!workItemId;
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    // Form fields state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [discussion, setDiscussion] = useState("");
    const [isDiscussionActive, setIsDiscussionActive] = useState(false);
    const [assignedMember, setAssignedMember] = useState(null);
    const [workItemComments, setWorkItemComments] = useState([]);
    const [state, setState] = useState({ label: 'To Do' });
    const [reason, setReason] = useState({ label: 'Added To Backlog' });
    const [area, setArea] = useState('');
    const [iteration, setIteration] = useState('');
    const [activity, setActivity] = useState('');
    const [remaining, setRemaining] = useState('');
    const [severity, setSeverity] = useState('2');
    const [stackRank, setStackRank] = useState('');

    const [formData, setFormData] = useState({
        priority: 2,
        effort: '',
        startDate: null,
        targetDate: null,
        tags: [],
    });

    // Dropdown options state
    const [areaOptions, setAreaOptions] = useState([]);
    const [iterationOptions, setIterationOptions] = useState([]);

    // Validation errors
    const [effortError, setEffortError] = useState('');
    const [titleError, setTitleError] = useState('');

    // Work item type state
    const [workItemType, setWorkItemType] = useState(actionType || 'Epic');

    // Get user, project, and repo from Redux
    const { user } = useSelector((state) => state.auth);
    const { id: projectId, name: projectName } = useSelector((state) => state.project);
    const { selectedRepo } = useSelector((state) => state.repo);

    // Create Work Item mutation
    const { mutate: createWorkItemMutation, isPending: saving } = useCreateWorkItem({
        mutation: {
            onSuccess: (response) => {
                const updateWorkItemPath = pathname.replace(/\/create.*/, `/${response.data.data.id}/edit`);
                router.push(updateWorkItemPath);
                //Invalidate the query from Repo Scope
                queryClient.invalidateQueries({ queryKey: workItemKeys.repo(projectId, selectedRepo?.id) });

                if (typeof onCreateWorkItemSuccess === "function") {
                    onCreateWorkItemSuccess();
                }
            },
            onError: (error) => {
                console.error('Error creating work item:', error);
                const errorMessage = error?.message ||
                    error?.response?.data?.error ||
                    'Failed to create work item';
                showError(errorMessage);
            }
        }
    });

    //Update Work Item mutation
    const { mutate: updateWorkItemMutation, isPending: isUpdatingWorkItem } = useUpdateWorkItem({
        mutation: {
            onSuccess: (response) => {
                //Invalidate Detail and Repo Scope Query
                queryClient.invalidateQueries({
                    queryKey: workItemKeys.repo(projectId, selectedRepo?.id)
                });

                queryClient.invalidateQueries({
                    queryKey: workItemKeys.detail(response.data.data.id)
                });
                
                setDiscussion('');
                setIsDiscussionActive(false);
                if (typeof onUpdateWorkItemSuccess === "function") {
                    onUpdateWorkItemSuccess();
                }
            },
            onError: (error) => {
                console.error('Error updating work item:', error);
                const errorMessage = error?.message ||
                    error?.response?.data?.error ||
                    'Failed to update work item';
                showError(errorMessage);
            },
        }
    })

    // Create Comment Mutation
    const { mutate: createCommentMutation, isPending: isCreatingComment } = useCreateWorkItemComment({
        mutation: {
            onSuccess: (response) => {
                // Add new comment to the list
                if (response?.data?.data) {
                    setWorkItemComments(prev => [response.data.data, ...prev]);
                }
                // Clear and deactivate discussion editor
                setDiscussion('');
                setIsDiscussionActive(false);
                // Refresh comments
                queryClient.invalidateQueries({ queryKey: commentKeys.list(workItemId) });
            },
            onError: (error) => {
                showError(error?.message || 'Failed to add comment');
            }
        }
    });

    //Update Comment mutation
    const { mutateAsync: updateCommentMutation, isPending: isUpdatingComment } = useUpdateWorkItemComment({
        mutation: {
            onSuccess: (response) => {
                // Update comment in the list
                if (response?.data?.data) {
                    setWorkItemComments(prev =>
                        prev.map(c => c._id === response.data.data._id ? response.data.data : c)
                    );
                }
                queryClient.invalidateQueries({ queryKey: commentKeys.list(workItemId) });
            },
            onError: (error) => {
                showError(error?.message || 'Failed to update comment');
            }
        }
    });

    //Delete Comment Mutation
    const { mutateAsync: deleteCommentMutation, isPending: isDeletingComment } = useDeleteWorkItemComment({
        mutation: {
            onSuccess: (response, variables) => {
                // Remove comment from the list
                setWorkItemComments(prev => prev.filter(c => c._id !== variables.id));
                queryClient.invalidateQueries({ queryKey: commentKeys.list(workItemId) });
            },
            onError: (error) => {
                showError(error?.message || 'Failed to delete comment');
            }
        }
    });

    //Add Comment Reaction Mutation
    const { mutateAsync: addCommentReactionMutation, isPending: isAddingCommentReaction } = useAddCommentReaction({
        mutation: {
            onSuccess: (response) => {
                // Update comment in the list
                if (response?.data?.data) {
                    setWorkItemComments(prev =>
                        prev.map(c => c._id === response.data.data._id ? response.data.data : c)
                    );
                }
                queryClient.invalidateQueries({ queryKey: commentKeys.list(workItemId) });
            },
            onError: (error) => {
                showError(error?.message || 'Failed to add reaction');
            }
        }
    })

    // Comment handlers
    const handleCreateComment = () => {
        if (!discussion.trim() || !workItemId) return;
        createCommentMutation({ id: workItemId, data: { comment: discussion } });
    };

    const handleCancelComment = () => {
        setDiscussion('');
        setIsDiscussionActive(false);
    };

    const handleUpdateComment = async (commentId, newContent) => {
        if (!commentId || !newContent.trim()) return;
        await updateCommentMutation({ id: commentId, data: { comment: newContent } });
    };

    const handleDeleteComment = async (commentId) => {
        if (!commentId) return;
        await deleteCommentMutation({ id: commentId });
    };

    const handleAddCommentReaction = async (commentId, reaction) => {
        if (!commentId || !reaction) return;
        await addCommentReactionMutation({ id: commentId, data: { reaction } });
    }

    // State for work item data
    const [workItemResponse, setWorkItemResponse] = useState(null);
    const [isLoadingWorkItem, setIsLoadingWorkItem] = useState(false);
    const [isWorkItemError, setIsWorkItemError] = useState(false);
    const [workItemError, setWorkItemError] = useState(null);

    // Fetch work item data when in edit mode using direct API call
    useEffect(() => {
        if (!isEditMode || !workItemId) return;

        const fetchWorkItem = async () => {
            setIsLoadingWorkItem(true);
            setIsWorkItemError(false);
            setWorkItemError(null);

            try {
                const response = await getWorkItemById(workItemId);
                setWorkItemResponse(response);
            } catch (error) {
                console.error('Error fetching work item:', error);
                setIsWorkItemError(true);
                setWorkItemError(error);
            } finally {
                setIsLoadingWorkItem(false);
            }
        };

        fetchWorkItem();
    }, [isEditMode, workItemId]);

    const {
        data: workItemCommentsResponse,
        isLoading: isLoadingComments,
    } = useGetWorkItemComments(workItemId, {
        query: { enabled: isEditMode, queryKey: commentKeys.list(workItemId) }
    });

    // Populate form when work item data is fetched
    useEffect(() => {
        if (isEditMode && workItemResponse?.data?.data) {
            const workItem = workItemResponse.data.data;
            setTitle(workItem.title || '');
            setDescription(workItem.description || '');
            // Convert string values to object format with label property for Dropdown components
            setState(workItem.state ? { label: workItem.state } : { label: 'To Do' });
            setReason(workItem.reason ? { label: workItem.reason } : { label: 'Added To Backlog' });
            setArea(workItem.area ? { label: workItem.area } : '');
            setIteration(workItem.iteration ? { label: workItem.iteration } : '');
            setWorkItemType(workItem.type);

            if (workItem.assignedTo) {
                setAssignedMember(workItem.assignedTo);
            }

            setFormData(prev => ({
                ...prev,
                priority: workItem.priority,
                effort: workItem.effort?.toString() || '',
                startDate: workItem.startDate ? workItem.startDate : '',
                targetDate: workItem.targetDate ? workItem.targetDate : '',
                tags: workItem.tags || [],
            }));

            setSeverity(workItem.severity?.toString() || '2');
            setActivity(workItem.activity ? { label: workItem.activity } : '');
            setRemaining(workItem.remainingWork?.toString() || '');
            setStackRank(workItem.stackRank?.toString() || '');
        }
    }, [isEditMode, workItemResponse]);

    // Populate comments
    useEffect(() => {
        if (isEditMode && workItemCommentsResponse?.data?.data) {
            setWorkItemComments(workItemCommentsResponse.data.data);
        }
    }, [isEditMode, workItemCommentsResponse]);

    // Set area/iteration options
    useEffect(() => {
        setAreaOptions([{ label: projectName, value: projectName }]);
    }, [projectName]);

    useEffect(() => {
        const iterations = ['Synxa/Iteration1', 'Synxa/Iteration2', 'Synxa/Iteration3'];
        setIterationOptions(iterations.map(i => ({ label: i })));
        if (iterations.length > 0) setIteration(iterations[0]);
    }, []);

    // Handlers
    const handleChange = (field) => (value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFormDataChange = (field) => (value) => {
        if(value === undefined) {
            console.warn("Value is undefined in handleFormDataChange",value);
            return;
        };
        //Get the value from dropdown selection if the value is object.
        let selectedValue = value;
        if(typeof value === "object" && Object.keys(value).includes("value")) {
            const {label,value:dropDownValue} = value;
            selectedValue=dropDownValue
        }
        setFormData((prev) => ({...prev, [field]: selectedValue}));
    }

    const handleEffortChange = (value) => {
        setFormData((prev) => ({ ...prev, effort: value }));
        if (value && isNaN(Number(value))) {
            setEffortError("The value for field 'Effort' is not of the right type.");
        } else {
            setEffortError('');
        }
    };

    const formatWorkItemType = (type) => {
        if (!type) return 'Task';
        return type.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const isSaveDisabled = !title || !projectId || !selectedRepo?.id || !!effortError || saving || isUpdatingWorkItem;

    const handleSave = () => {
        if (isSaveDisabled) return;
        setTitleError('');

        if (!title) {
            setTitleError("Field 'Title' cannot be empty.");
            return;
        }

        if (!projectId || !selectedRepo?.id) {
            setTitleError("Project and Repository are required.");
            return;
        }

        const payload = {
            title: title.trim(),
            type: formatWorkItemType(workItemType),
            project: projectId,
            repo: selectedRepo.id,
            description: description || undefined,
            state: state?.label || 'To Do',
            reason: reason?.label || 'Added To Backlog',
            area: area?.label || undefined,
            iteration: iteration?.label || undefined,
            assignedTo: (typeof assignedMember === "object" ? assignedMember?._id : assignedMember) || null,
            priority: formData.priority,
            effort: formData.effort ? parseFloat(formData.effort) : undefined,
            startDate: formData.startDate || undefined,
            targetDate: formData.targetDate || undefined,
            tags: formData.tags?.length > 0 ? formData.tags : undefined,
            activity: activity?.label || undefined,
            remainingWork: remaining ? parseFloat(remaining) : undefined,
            severity: severity ? parseInt(severity.split(' - ')[0]) || 2 : 2,
            parentId: parentId || undefined,
        };

        if (discussion.length > 0) {
            payload.comments = [{ comment: discussion }];
        }

        if(isDiscussionActive) {
            setIsDiscussionActive(false);
        }

        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== undefined)
        );

        if (isEditMode) {
            updateWorkItemMutation({ id: workItemId, data: cleanPayload })
        } else {
            createWorkItemMutation({ data: cleanPayload });
        }

    };

    // Loading state
    if (isEditMode && isLoadingWorkItem) {
        return (
            <div className="w-full h-[80vh] bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <CircularProgress />
                    <p className="text-gray-500">Loading work item...</p>
                </div>
            </div>
        );
    }


    // Error state
    if (isEditMode && isWorkItemError) {
        return (
            <div className="w-full h-[80vh] bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-red-500">
                    <p>Error loading work item</p>
                    <p className="text-sm">{workItemError?.message || 'An error occurred'}</p>
                    <button onClick={onClose} className="text-blue-600 hover:underline">Go back</button>
                </div>
            </div>
        );
    }

    const effectiveActionType = workItemType?.toLowerCase() || actionType?.toLowerCase() || 'task';

    return (
        <div className="w-full h-full bg-white">
            {/* Navigation Header */}
            {type === WORKITEM_PAGE_TYPE.PAGE && <section className='flex gap-6 ml-3 py-3 border-b border-gray-200'>
                <p className='p-2 font-light'>Work Items</p>
                <Divider orientation="vertical" sx={{ py: 2 }} />
                <div
                    className='flex gap-2 transition-colors items-center cursor-pointer p-2 hover:bg-gray-100 rounded-md'
                    onClick={onClose}
                >
                    <CornerUpLeftIcon size={16} />
                    <p>Back to Work Items</p>
                </div>
            </section>}

            {/* Page Content Container */}
            <div className="bg-white w-full h-full flex flex-col">
                <div className="overflow-y-auto flex-grow">
                    <div className="bg-white">
                        <div className="bg-white w-full max-md:max-w-full">
                            <div className="bg-white w-full py-0.5 max-md:max-w-full">
                                <BugHeader
                                    onClose={onClose}
                                    actionType={effectiveActionType}
                                    title={title}
                                    onTitleChange={setTitle}
                                    onSave={handleSave}
                                    handleChange={handleChange('tags')}
                                    isSaveDisabled={isSaveDisabled}
                                    repoId={selectedRepo?.id}
                                    onMemberSelect={(member) => setAssignedMember(member)}
                                    assignedMember={assignedMember}
                                    isEditMode={isEditMode}
                                    workItemId={workItemId}
                                    workItemNumber={workItemResponse?.data?.data?.number}
                                    workItemTags={formData.tags}
                                    workItemCommentsLength={workItemCommentsResponse?.data?.data?.length}
                                    isLoading={isUpdatingWorkItem || saving}
                                />
                                <BugDetails
                                    state={state}
                                    onStateChange={setState}
                                    reason={reason}
                                    onReasonChange={setReason}
                                    area={area}
                                    onAreaChange={setArea}
                                    iteration={iteration}
                                    onIterationChange={setIteration}
                                    areaOptions={areaOptions}
                                    iterationOptions={iterationOptions}
                                />

                                <section className="overflow-hidden p-2 overflow-y-scroll">
                                    <div className="mt-1 w-full max-md:max-w-full">
                                        <div className="flex gap-5 max-md:flex-col">
                                            {/* Left Column - Description & Discussion */}
                                            <article className="w-[51%] max-md:ml-0 max-md:w-full">
                                                <div className="max-md:mt-4 max-md:max-w-full">
                                                    {/* Description Section */}
                                                    <CollapsibleSection title="Description" defaultExpanded={true}>
                                                        <div className="rounded bg-gray-50 min-h-[120px]">
                                                            <TextEditor
                                                                value={description}
                                                                onChange={setDescription}
                                                                placeholder="Enter description..."
                                                            />
                                                        </div>
                                                    </CollapsibleSection>

                                                    {/* Discussion Section */}
                                                    <CollapsibleSection
                                                        title="Discussion"
                                                        defaultExpanded={true}
                                                        className="mt-10"
                                                    >
                                                        <div className="flex flex-wrap gap-3 items-start text-sm text-black">
                                                            
                                                            <div
                                                                className="flex overflow-hidden flex-col grow shrink-0 justify-center p-0.5 rounded-md border border-gray-200 border-solid basis-0 w-fit max-md:max-w-full bg-white"
                                                                onClick={() => !isDiscussionActive && setIsDiscussionActive(true)}
                                                            >
                                                                {isDiscussionActive ? (
                                                                    <>
                                                                        <div className="rounded bg-gray-50 min-h-[120px]">
                                                                            <TextEditor
                                                                                isEmojiDisabled={true}
                                                                                value={discussion}
                                                                                onChange={setDiscussion}
                                                                                placeholder="Add a comment. Use # to link a work item, @ to mention a person..."
                                                                                autoFocus={true}
                                                                            />
                                                                        </div>
                                                                        {/* Save/Cancel buttons */}
                                                                        <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                                                                            <button
                                                                                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                                                                onClick={handleCancelComment}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                                                onClick={handleCreateComment}
                                                                                disabled={!discussion.trim() || isCreatingComment || !isEditMode}
                                                                            >
                                                                                {isCreatingComment ? 'Saving...' : 'Save'}
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="px-3 py-4 text-gray-500 cursor-text">
                                                                        Add a comment. Use # to link a work item, @ to mention a person...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CollapsibleSection>

                                                    {/* Existing Comments List */}
                                                    {isEditMode && workItemComments.length > 0 && (
                                                        <div className='mt-6'>
                                                            <div className="space-y-4">
                                                                {workItemComments.map((comment) => (
                                                                    <div
                                                                        key={comment._id}
                                                                        className="p-4 bg-gray-50 rounded-md border px-4 border-gray-100"
                                                                    >
                                                                        <CommentItem
                                                                            comment={comment}
                                                                            onSaveEdit={handleUpdateComment}
                                                                            onDelete={handleDeleteComment}
                                                                            isDeletingComment={isDeletingComment}
                                                                            isUpdatingComment={isUpdatingComment}
                                                                            onAddReaction={handleAddCommentReaction}
                                                                            isUpdatingWorkItem={isUpdatingWorkItem}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </article>

                                            {/* Middle Column - Planning */}
                                            <aside className="w-[24%] max-md:ml-0 max-md:w-full">
                                                <div className="max-w-none w-[298px] flex flex-col gap-5 mx-auto pb-[42px] max-md:max-w-[500px] max-md:w-full max-md:mx-auto max-md:my-0 max-sm:max-w-screen-sm max-sm:p-4">
                                                    <PlanningPanel
                                                        workItemType={effectiveActionType}
                                                        priority={formData.priority}
                                                        onPriorityChange={handleFormDataChange('priority')}
                                                        activity={activity}
                                                        onActivityChange={setActivity}
                                                        remaining={remaining}
                                                        onRemainingChange={setRemaining}
                                                        startDate={formData.startDate}
                                                        onStartDateChange={handleChange('startDate')}
                                                        targetDate={formData.targetDate}
                                                        onTargetDateChange={handleChange('targetDate')}
                                                        effort={formData.effort}
                                                        onEffortChange={handleEffortChange}
                                                        effortError={effortError}
                                                    />
                                                </div>
                                            </aside>

                                            {/* Right Column - Sidebar Sections */}
                                            <article className="ml-5 w-[24%] max-md:ml-0 max-md:w-full">
                                                <SidebarSections />
                                            </article>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkItem;
