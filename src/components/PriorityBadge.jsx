import clsx from 'clsx';

const PriorityBadge = ({ priority }) => {
    const styles = {
        LOW: 'bg-green-50 text-green-700 border border-green-200',
        MEDIUM: 'bg-blue-50 text-blue-700 border border-blue-200',
        HIGH: 'bg-orange-50 text-orange-700 border border-orange-200',
        URGENT: 'bg-red-50 text-red-700 border border-red-200',
    };

    return (
        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', styles[priority])}>
            {priority}
        </span>
    );
};

export default PriorityBadge;
