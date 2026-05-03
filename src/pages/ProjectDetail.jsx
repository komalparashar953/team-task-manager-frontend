import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserPlus, Settings, LayoutList, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberList from '../components/MemberList';
import EmptyState from '../components/EmptyState';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('tasks'); // tasks, members, settings
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');

    // Fetch Project Details (includes members)
    const { data: projectRes, isLoading: projLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const response = await api.get(`/projects/${id}`);
            return response.data.data.project;
        }
    });

    // Fetch Tasks
    const { data: tasksRes, isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks', id],
        queryFn: async () => {
            const response = await api.get(`/projects/${id}/tasks`);
            return response.data.data.tasks;
        }
    });

    const inviteMutation = useMutation({
        mutationFn: async (email) => {
            return api.post(`/projects/${id}/members`, { email });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', id]);
            toast.success('Member invited successfully');
            setInviteEmail('');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to invite member');
        }
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async () => {
            return api.delete(`/projects/${id}`);
        },
        onSuccess: () => {
            toast.success('Project deleted');
            navigate('/projects');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    });

    if (projLoading || tasksLoading) return <div className="mt-20"><Spinner className="w-10 h-10" /></div>;
    if (!projectRes) return <div>Project not found</div>;

    const project = projectRes;
    const tasks = tasksRes || [];

    const currentMember = project.members.find(m => m.userId === user.id);
    const currentRole = currentMember?.role || 'MEMBER';
    const isAdmin = currentRole === 'ADMIN';

    const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow px-6 py-8 border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                    <p className="mt-2 text-gray-500">{project.description}</p>
                )}

                <div className="flex border-b border-gray-200 mt-8">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center ${activeTab === 'tasks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <LayoutList className="w-4 h-4 mr-2" /> Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center ${activeTab === 'members' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <Users className="w-4 h-4 mr-2" /> Members ({project.members.length})
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center ${activeTab === 'settings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </button>
                    )}
                </div>
            </div>

            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setSelectedTask(null); setIsTaskModalOpen(true); }}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" /> New Task
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                        {statuses.map(status => {
                            const columnTasks = tasks.filter(t => t.status === status);
                            return (
                                <div key={status} className="bg-gray-100 p-4 rounded-lg flex flex-col h-full min-h-[500px]">
                                    <h3 className="font-semibold text-gray-700 mb-4 flex justify-between">
                                        {status.replace('_', ' ')}
                                        <span className="bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs">{columnTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {columnTasks.map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                                            />
                                        ))}
                                        {columnTasks.length === 0 && (
                                            <div className="text-center py-6 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                                Drop items here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MEMBERS TAB */}
            {activeTab === 'members' && (
                <div className="space-y-6 max-w-4xl">
                    {isAdmin && (
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-end space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Invite new member by email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (inviteEmail) inviteMutation.mutate(inviteEmail);
                                }}
                                disabled={inviteMutation.isPending || !inviteEmail}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <UserPlus className="w-4 h-4 mr-2" /> Invite
                            </button>
                        </div>
                    )}

                    <MemberList
                        members={project.members}
                        projectId={project.id}
                        currentRole={currentRole}
                        currentUserId={user.id}
                    />
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && isAdmin && (
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-2xl">
                    <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Once you delete a project, there is no going back. Please be certain.
                    </p>
                    <button
                        onClick={() => {
                            if (confirm('Are you absolutely sure you want to delete this project? This action cannot be undone.')) {
                                deleteProjectMutation.mutate();
                            }
                        }}
                        disabled={deleteProjectMutation.isPending}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                        Delete Project
                    </button>
                </div>
            )}

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTask}
                projectId={id}
                projectMembers={project.members}
                currentRole={currentRole}
                currentUserId={user.id}
            />
        </div>
    );
};

export default ProjectDetail;
