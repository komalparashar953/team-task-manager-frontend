import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users, CheckSquare, FolderGit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const schema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().max(500).optional(),
});

const ProjectList = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await api.get('/projects');
            return response.data.data.projects;
        }
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/projects', data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['projects']);
            toast.success('Project created successfully');
            setIsModalOpen(false);
            reset();
            navigate(`/projects/${data.data.project.id}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create project');
        }
    });

    const projects = projectsData || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FolderGit2 className="mr-2 text-indigo-600" />
                    Projects
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                </button>
            </div>

            {isLoading ? (
                <div className="mt-20"><Spinner className="w-10 h-10" /></div>
            ) : projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <EmptyState
                        title="No projects found"
                        message="Get started by creating a new project."
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition duration-150 p-6 flex flex-col h-full"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                    {project.description || 'No description provided.'}
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                                        {project._count.members}
                                    </span>
                                    <span className="flex items-center">
                                        <CheckSquare className="w-4 h-4 mr-1 text-gray-400" />
                                        {project._count.tasks}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
                        </div>
                        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                                    <input
                                        {...register('name')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 sm:flex-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 flex-1 sm:flex-none disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectList;
