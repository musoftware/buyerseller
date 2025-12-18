import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

async function getGigs() {
    return prisma.gig.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            seller: {
                select: { fullName: true, email: true }
            }
        }
    });
}

export default async function GigsPage() {
    const gigs = await getGigs();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Gig Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Title</th>
                            <th className="px-6 py-4 font-semibold">Seller</th>
                            <th className="px-6 py-4 font-semibold">Price (Start)</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Orders</th>
                            <th className="px-6 py-4 font-semibold">Created</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {gigs.map((gig) => (
                            <tr key={gig.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900 max-w-xs truncate" title={gig.title}>
                                            {gig.title}
                                        </div>
                                        <Link href={`/gig/${gig.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{gig.seller.fullName}</div>
                                    <div className="text-xs text-gray-500">{gig.seller.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {formatCurrency(gig.price)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${gig.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {gig.status.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {gig.totalOrders}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDistanceToNow(gig.createdAt, { addSuffix: true })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-sm text-red-600 hover:text-red-700 font-medium ml-4">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
