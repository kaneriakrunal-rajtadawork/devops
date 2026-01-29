'use client';

import { Edit, SmilePlus, Trash, Check, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import TextEditor from '@/components/reusables/TextEditor';
import ConfirmModal from '@/components/reusables/ConfirmModal';
import Button from '@/components/reusables/Button';
import Tooltip from '@/components/ui/Tooltip';
import { Avatar } from '@mui/material';

// Available reactions
const REACTIONS = [
    { emoji: '👍', label: 'Thumbs Up', value: 'thumbsUp' },
    { emoji: '👎', label: 'Thumbs Down', value: 'thumbsDown' },
    { emoji: '❤️', label: 'Heart', value: 'heart' },
    { emoji: '🎉', label: 'Celebrate', value: 'celebrate' },
    { emoji: '😄', label: 'Laugh', value: 'laugh' },
    { emoji: '😢', label: 'Sad', value: 'sad' },
];

/**
 * Displays a single comment in the discussion section.
 * 
 * @param {Object} comment - The comment object
 * @param {string} comment._id - Comment ID
 * @param {string} comment.comment - HTML comment content
 * @param {Object|null} comment.createdByUser - User who created the comment
 * @param {string} comment.createdAt - Timestamp when comment was created
 * @param {Array} comment.reactions - Reactions on the comment
 * @param {Function} onAddReaction - Callback when a reaction is added
 * @param {Function} onSaveEdit - Callback when edit is saved (receives commentId and new content)
 * @param {Function} onDelete - Callback when delete is confirmed
 */
export const CommentItem = ({ comment, onAddReaction, onSaveEdit, onDelete, isUpdatingComment = false, isDeletingComment = false, isUpdatingWorkItem = false }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.comment);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const reactionPickerRef = useRef(null);

    // Close reaction picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
                setShowReactionPicker(false);
            }
        };

        if (showReactionPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showReactionPicker]);

    useEffect(() => {
        if(isUpdatingWorkItem) {
            setIsEditing(false);
            setEditedContent(comment?.comment || "");
        }
    },[isUpdatingWorkItem])

    // Format the date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get user display name
    const getUserName = () => {
        if (comment.createdByUser?.name) return comment.createdByUser.name;
        if (comment.createdByUser?.email) return comment.createdByUser.email;
        return 'Unknown User';
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleReactionClick = async (reaction) => {
        if (onAddReaction) {
            try {
                await onAddReaction(comment._id, reaction.value);
                setShowReactionPicker(false);
            } catch (error) {
                console.error("Error adding reaction:", error);
            }
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedContent(comment.comment);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(comment.comment);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (onSaveEdit) {
            try {
                await onSaveEdit(comment._id, editedContent);
                setIsEditing(false);
            } catch (error) {
                console.error("Error saving edited comment:", error);
            }
        }
    };

    return (
        <div className="group flex gap-3 w-full">
            {/* User Avatar */}
            <Avatar
                sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    mr: 1.5,
                    bgcolor: '#3b82f6'
                }}
            >
                {getInitials(comment?.createdByUser?.name)}
            </Avatar>

            {/* Comment Content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header: User name, date, and action icons */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black">
                            {getUserName()}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDate(comment?.createdAt)}
                        </span>
                    </div>

                    {/* Action icons - visible on hover OR when reaction picker is open OR when editing */}
                    <div className={`flex gap-2 transition-opacity duration-200 ${(showReactionPicker || isEditing) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {!isEditing && (
                            <>
                                {/* Reaction Button with Picker */}
                                <div className="relative" ref={reactionPickerRef}>
                                          
                                    <Tooltip  title="Add Reaction">
                                        <button
                                            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                                        >
                                            <SmilePlus size={16} />
                                        </button>
                                    </Tooltip>

                                    {/* Reaction Picker Dropdown */}
                                    {showReactionPicker && (
                                        <div className="absolute top-full right-0 mt-1 flex gap-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                            {REACTIONS.map((reaction) => (
                                                <button
                                                    key={reaction.value}
                                                    onClick={() => handleReactionClick(reaction)}
                                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors text-xl"
                                                    title={reaction.label}
                                                >
                                                    {reaction.emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Tooltip title="Edit Comment">
                                    <button
                                        className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                                        
                                        onClick={handleEditClick}
                                    >
                                        <Edit size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Delete Comment">
                                    <button
                                        className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                                      
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <Trash size={16} />
                                    </button>
                                </Tooltip>
                            </>
                        )}
                    </div>
                </div>

                {/* Comment Body - renders HTML content */}
                <TextEditor
                    disabled={!isEditing}
                    autoHeight={!isEditing}
                    value={isEditing ? editedContent : comment.comment}
                    onChange={setEditedContent}
                    key={`${comment?._id}-${isEditing}`}
                    autoFocus={isEditing}
                />

                {/* Update and Cancel buttons - shown at bottom right when editing */}
                {isEditing && (
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            className="px-3 py-1.5 text-sm border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={handleCancelEdit}
                        >
                            Cancel
                        </button>
                        <Button onClick={handleSaveEdit}
                            disabled={editedContent === comment.comment || isUpdatingComment} key="update-comment" loading={isUpdatingComment} variant='primary' >
                            {isUpdatingComment ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                )}

                {/* Reactions (if any) */}
                {comment.reactions && comment.reactions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                        {comment.reactions.map((reaction, index) => {
                            // Find the emoji for this reaction value
                            const reactionData = REACTIONS.find(r => r.value === reaction.reaction);
                            const emoji = reactionData?.emoji || reaction.reaction;

                            return (
                                <button
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs cursor-pointer transition-colors"
                                    title={reactionData?.label || reaction.reaction}
                                    onClick={() => onAddReaction?.(comment._id, reaction.reaction)}
                                >
                                    <span>{emoji}</span>
                                    {reaction.reactedUsers?.length > 0 && (
                                        <span className="text-gray-500">
                                            {reaction.reactedUsers.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                maxWidth="xs"
                actions={
                    <>
                        <Button variant='primary' onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant='danger' loading={isDeletingComment} disabled={isDeletingComment} key="delete-comment" onClick={async (e) => {
                            e.preventDefault();
                            try {
                                await onDelete?.(comment._id);
                                setShowDeleteModal(false);
                            } catch (error) {
                                console.error("Error deleting comment:", error);
                            }
                        }}>
                            {isDeletingComment ? 'Deleting...' : 'Delete'}
                        </Button>
                    </>
                }
            >
                Are you sure you want to delete this comment?
            </ConfirmModal>
        </div>
    );
};

export default CommentItem;

