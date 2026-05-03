import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, Clock, FolderGit2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const Dashboard = () => {
    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await api.get('/dashboard');
            return response.data.data;
        }
    });

    if (isLoading) return <div className="mt-20"><Spinner className="w-10 h-10" /></div>;
    if (error) return <div className="text-center text-red-500 mt-20">Error loading dashboard</div>;

    const { myTasks, overdueTasks, tasksByStatus, projectSummaries } = dashboardData;

    const stats = [
        { name: 'My Active Tasks', stat: myTasks.length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Overdue Tasks', stat: overdueTasks.length, icon: Clock, color: 'text-red-600', bg: 'bg-red-100' },
        { name: 'Projects', stat: projectSummaries.length, icon: FolderGit2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <LayoutDashboard className="mr-3 text-indigo-600" />
                    Dashboard Overview
                </h1>
            </div>

            {/* Stats row */}
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-200">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Task Status Breakdown */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Task Status (Across all projects)</h2>
                    <div className="space-y-4">
                        {Object.entries(tasksByStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center">
                                <div className="w-32 text-sm font-medium text-gray-600">{status.replace('_', ' ')}</div>
                                <div className="flex-1 ml-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${status === 'DONE' ? 'bg-green-500' : 'bg-indigo-600'}`}
                                            style={{ width: `${Math.min((count / Math.max(1, Object.values(tasksByStatus).reduce((a, b) => a + b, 0))) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="ml-4 text-sm text-gray-500 w-8 text-right">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overdue Tasks List */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h2 className="text-lg font-medium text-red-600 flex items-center mb-4">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Urgent: Overdue Tasks
                    </h2>
                    {overdueTasks.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">No overdue tasks. Great job!</p>
                    ) : (
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {overdueTasks.slice(0, 5).map(task => (
                                    <li key={task.id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {task.title}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    Project: {task.project.name}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {overdueTasks.length > 5 && (
                                <div className="mt-4 text-center text-sm">
                                    <span className="text-gray-500">and {overdueTasks.length - 5} more...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
