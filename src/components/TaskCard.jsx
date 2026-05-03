import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const TaskCard = ({ task, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h4>
                <StatusBadge status={task.status} />
            </div>

            <div className="mb-4">
                <PriorityBadge priority={task.priority} />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                <div className="flex items-center space-x-4">
                    {task.dueDate && (
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-600 font-medium' : ''}>
                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </span>
                        </div>
                    )}
                </div>

                {task.assignee && (
                    <div className="flex items-center" title={`Assigned to ${task.assignee.name}`}>
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="truncate max-w-[100px]">{task.assignee.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
