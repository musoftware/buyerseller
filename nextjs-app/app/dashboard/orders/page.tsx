import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = session.user as any;
    const isSeller = user.role === "SELLER";

    const orders = await prisma.order.findMany({
        where: {
            [isSeller ? "sellerId" : "buyerId"]: user.id,
        },
        include: {
            gig: true,
            buyer: true,
            seller: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
                <div className="flex space-x-2">
                    {/* Filters could go here */}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                        <p className="text-gray-500 mt-2">
                            {isSeller ? "You haven't received any orders yet." : "You haven't placed any orders yet."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                                    <th className="px-6 py-4">Gig</th>
                                    <th className="px-6 py-4">Order Date</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {orders.map((order) => {
                                    // Gig images parsing
                                    let gigImage = "";
                                    try {
                                        const imgs = JSON.parse(order.gig.images as string);
                                        gigImage = imgs[0];
                                    } catch (e) {
                                        gigImage = "/placeholder.jpg";
                                    }

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <Image src={gigImage} alt={order.gig.title} fill className="object-cover" />
                                                    </div>
                                                    <div className="max-w-xs">
                                                        <p className="font-medium text-gray-900 line-clamp-1">{order.gig.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {isSeller ? `Buyer: ${order.buyer.fullName}` : `Seller: ${order.seller.fullName}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(order.deliveryDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.status === 'IN_PROGRESS' || order.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-gray-50 text-gray-700 border-gray-100'
                                                    }`}>
                                                    {order.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                                                    {order.status === 'IN_PROGRESS' && <Clock size={12} />}
                                                    {order.status === 'CANCELLED' && <XCircle size={12} />}
                                                    {order.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
