import clsx from 'clsx';

const StatusBadge = ({ status }) => {
    const styles = {
        TODO: 'bg-gray-100 text-gray-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        IN_REVIEW: 'bg-purple-100 text-purple-800',
        DONE: 'bg-green-100 text-green-800',
    };

    const labels = {
        TODO: 'To Do',
        IN_PROGRESS: 'In Progress',
        IN_REVIEW: 'In Review',
        DONE: 'Done',
    };

    return (
        <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', styles[status])}>
            {labels[status]}
        </span>
    );
};

export default StatusBadge;
