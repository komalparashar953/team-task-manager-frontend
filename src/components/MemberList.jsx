import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserMinus, Shield, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MemberList = ({ members, projectId, currentRole, currentUserId }) => {
    const queryClient = useQueryClient();

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            return api.patch(`/projects/${projectId}/members/${userId}`, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Role updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    });

    const removeMemberMutation = useMutation({
        mutationFn: async (userId) => {
            return api.delete(`/projects/${projectId}/members/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Member removed');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to remove member');
        }
    });

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4 border border-gray-200">
            <ul className="divide-y divide-gray-200">
                {members.map((member) => (
                    <li key={member.user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                                {member.user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                                <div className="text-sm text-gray-500">{member.user.email}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {member.role === 'ADMIN' ? <ShieldAlert className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                                {member.role}
                            </span>

                            {currentRole === 'ADMIN' && member.user.id !== currentUserId && (
                                <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                                    <select
                                        value={member.role}
                                        onChange={(e) => updateRoleMutation.mutate({ userId: member.user.id, role: e.target.value })}
                                        disabled={updateRoleMutation.isPending}
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 border"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>

                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to remove this member?')) {
                                                removeMemberMutation.mutate(member.user.id);
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Remove member"
                                    >
                                        <UserMinus className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MemberList;
