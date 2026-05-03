import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useEffect } from 'react';

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional().nullable().transform(val => val === "" ? null : val),
});

const TaskModal = ({ isOpen, onClose, task, projectId, projectMembers, currentRole, currentUserId }) => {
    const queryClient = useQueryClient();
    const isEditing = !!task;

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'TODO',
            priority: task?.priority || 'MEDIUM',
            dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            assigneeId: task?.assigneeId || '',
        }
    });

    useEffect(() => {
        reset({
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'TODO',
            priority: task?.priority || 'MEDIUM',
            dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            assigneeId: task?.assigneeId || '',
        });
    }, [task, reset]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            // transform dueDate to ISO if exists
            const payload = { ...data };
            if (payload.dueDate) {
                payload.dueDate = new Date(payload.dueDate).toISOString();
            } else {
                delete payload.dueDate;
            }

            if (isEditing) {
                return api.patch(`/projects/${projectId}/tasks/${task.id}`, payload);
            }
            return api.post(`/projects/${projectId}/tasks`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            toast.success(isEditing ? 'Task updated' : 'Task created');
            onClose();
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            return api.delete(`/projects/${projectId}/tasks/${task.id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            toast.success('Task deleted');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    });

    if (!isOpen) return null;

    const canEditFull = currentRole === 'ADMIN' || (currentRole === 'MEMBER' && task?.creatorId === currentUserId) || !isEditing;
    const canDelete = currentRole === 'ADMIN' || (currentRole === 'MEMBER' && task?.creatorId === currentUserId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {isEditing ? 'Edit Task' : 'Create Task'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            {...register('title')}
                            disabled={!canEditFull && isEditing}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            {...register('description')}
                            disabled={!canEditFull && isEditing}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                {...register('status')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                {...register('priority')}
                                disabled={!canEditFull && isEditing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                type="date"
                                {...register('dueDate')}
                                disabled={!canEditFull && isEditing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assignee</label>
                            <select
                                {...register('assigneeId')}
                                disabled={!canEditFull && isEditing}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="">Unassigned</option>
                                {projectMembers?.map(member => (
                                    <option key={member.user.id} value={member.user.id}>
                                        {member.user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between space-x-3">
                        {isEditing && canDelete ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this task?')) deleteMutation.mutate();
                                }}
                                className="inline-flex justify-center rounded-md border border-transparent bg-red-100 py-2 px-4 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none"
                            >
                                Delete
                            </button>
                        ) : <div></div>}

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
