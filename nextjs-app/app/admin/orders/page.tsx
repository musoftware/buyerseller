import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

async function getOrders() {
    return prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            buyer: { select: { fullName: true, email: true } },
            seller: { select: { fullName: true, email: true } },
            gig: { select: { title: true, slug: true } }
        }
    });
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Order ID</th>
                            <th className="px-6 py-4 font-semibold">Buyer</th>
                            <th className="px-6 py-4 font-semibold">Seller</th>
                            <th className="px-6 py-4 font-semibold">Gig</th>
                            <th className="px-6 py-4 font-semibold">Amount</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-family-mono text-gray-500">
                                    <Link href={`/dashboard/orders/${order.id}`} className="hover:underline text-emerald-600">
                                        #{order.id.slice(-6)}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.buyer.fullName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.seller.fullName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">{order.gig.title}</div>
                                        <Link href={`/gig/${order.gig.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {formatCurrency(order.totalAmount)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {order.status.toLowerCase().replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
