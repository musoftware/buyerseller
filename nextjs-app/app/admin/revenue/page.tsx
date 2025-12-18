"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { Loader2, DollarSign, TrendingUp, Calendar } from "lucide-react";

export default function RevenuePage() {
    const [range, setRange] = useState("30days");
    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalFees: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/admin/analytics/revenue?range=${range}`)
            .then(res => res.json())
            .then(res => {
                setData(res.data || []);
                setSummary(res.summary || { totalRevenue: 0, totalFees: 0 });
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [range]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Revenue & Financials</h1>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setRange("30days")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${range === "30days" ? "bg-emerald-100 text-emerald-800" : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Last 30 Days
                    </button>
                    <button
                        onClick={() => setRange("12months")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${range === "12months" ? "bg-emerald-100 text-emerald-800" : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Last 12 Months
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            +12.5%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Volume</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.totalRevenue)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            +8.2%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Platform Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.totalFees)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Based on fees</p>
                </div>

                {/* Placeholders for other metrics */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Pending Payouts</h3>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                    <p className="text-xs text-gray-400 mt-1">Held in escrow</p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                </div>

                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                    </div>
                ) : (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, '']}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name="Total Volume"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    name="Platform Fees"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
