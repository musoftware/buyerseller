import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
// import { verifyUser } from "@/app/actions/admin"; // We will create this later

async function getUsers() {
    return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">User</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Joined</th>
                            <th className="px-6 py-4 font-semibold">Verified</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                (user.name?.[0] || user.username?.[0] || "U").toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.fullName || user.username}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {user.isVerified ? (
                                        <CheckCircle className="text-green-500" size={18} />
                                    ) : (
                                        <XCircle className="text-gray-300" size={18} />
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
