import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Clock, CheckCircle2, MessageSquare, Upload, Star } from "lucide-react";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;
    const user = session.user as any;
    const isSeller = user.role === "SELLER";

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            gig: true,
            buyer: true,
            seller: true,
            review: true,
        },
    });

    if (!order) {
        notFound();
    }

    // Check access
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
        redirect("/dashboard/orders");
    }

    const gigImages = JSON.parse(order.gig.images as string);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-6)}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                            {order.status.replace("_", " ")}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()} • Due {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/messages?c=new&recipientId=${isSeller ? order.buyerId : order.sellerId}`} // Logic needs to find existing convo or create
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <MessageSquare size={18} />
                        Contact {isSeller ? "Buyer" : "Seller"}
                    </Link>
                    {/* Actions Component (Client) */}
                    <OrderActions order={order} isSeller={isSeller} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Progress / Status Tracker (Simplified) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Order Progress</h3>
                        <div className="relative">
                            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                            <div className="space-y-6 relative">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white z-10 shrink-0">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Order Placed</h4>
                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white z-10 shrink-0 ${['IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">In Progress</h4>
                                        {order.status !== 'PENDING' && <p className="text-sm text-emerald-600">Making progress...</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white z-10 shrink-0 ${['DELIVERED', 'COMPLETED'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                        <Upload size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Delivered</h4>
                                        {['DELIVERED', 'COMPLETED'].includes(order.status) && <p className="text-sm text-emerald-600">Work delivered for review.</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white z-10 shrink-0 ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Completed</h4>
                                        {order.status === 'COMPLETED' && <p className="text-sm text-emerald-600">Order marked as complete.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Requirements</h3>
                        {/* Parse JSON requirements */}
                        {Object.keys(JSON.parse(JSON.stringify(order.requirements || {}))).length > 0 ? (
                            <dl className="grid grid-cols-1 gap-y-4">
                                {Object.entries(JSON.parse(JSON.stringify(order.requirements))).map(([key, value]: any) => (
                                    <div key={key}>
                                        <dt className="text-sm font-medium text-gray-500">{key}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="text-gray-500 text-sm">No special requirements.</p>
                        )}
                    </div>

                    {/* Review Section */}
                    {order.status === "COMPLETED" && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Review</h3>
                            {order.review ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} className={i < order.review!.rating ? "fill-current" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <span className="font-bold">{order.review.rating}.0</span>
                                    </div>
                                    <p className="text-gray-700 italic">"{order.review.comment}"</p>
                                </div>
                            ) : (
                                !isSeller ? (
                                    <div className="text-center py-6">
                                        <p className="mb-4 text-gray-600">Please leave a review for the seller.</p>
                                        <Link href={`/dashboard/orders/${order.id}/review`} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                                            Leave a Review
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Waiting for buyer review.</p>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="aspect-video relative rounded-lg overflow-hidden mb-4 bg-gray-100">
                            <Image src={gigImages[0]} alt={order.gig.title} fill className="object-cover" />
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{order.gig.title}</h3>
                        <div className="flex justify-between items-center py-3 border-y border-gray-100 mb-3">
                            <span className="text-gray-600">Status</span>
                            <span className="font-bold text-gray-900">{order.status}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Package</span>
                            <span className="font-medium text-gray-900">{order.packageType}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Amount</span>
                            <span className="font-bold text-emerald-600 mb-1">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>

                    {/* User Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden relative bg-gray-100 mb-3">
                            <Image
                                src={(isSeller ? order.buyer.avatar : order.seller.avatar) || "/placeholder.jpg"}
                                alt="User"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h4 className="font-bold text-gray-900">{(isSeller ? order.buyer.fullName : order.seller.fullName)}</h4>
                        <p className="text-sm text-gray-500 mb-4">{isSeller ? "Buyer" : "Seller"}</p>
                        <button className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
