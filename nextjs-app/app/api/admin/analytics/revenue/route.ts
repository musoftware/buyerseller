import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format, endOfMonth, eachDayOfInterval, subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "30days"; // '30days' or '12months'

        if (range === "12months") {
            // Last 12 months breakdown
            const today = new Date();
            const last12Months = Array.from({ length: 12 }).map((_, i) => {
                const d = subMonths(today, i);
                return {
                    label: format(d, "MMM yyyy"),
                    date: d,
                    revenue: 0,
                    fees: 0
                };
            }).reverse();

            const startDate = startOfMonth(subMonths(today, 11));

            const orders = await prisma.order.findMany({
                where: {
                    createdAt: { gte: startDate },
                    status: "COMPLETED" // Or any paid status
                },
                select: {
                    createdAt: true,
                    totalAmount: true,
                    serviceFee: true
                }
            });

            orders.forEach(order => {
                const label = format(order.createdAt, "MMM yyyy");
                const monthParam = last12Months.find(m => m.label === label);
                if (monthParam) {
                    monthParam.revenue += order.totalAmount;
                    monthParam.fees += order.serviceFee;
                }
            });

            return NextResponse.json({
                data: last12Months.map(({ label, revenue, fees }) => ({ name: label, total: revenue, profit: fees })),
                summary: {
                    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    totalFees: orders.reduce((sum, o) => sum + o.serviceFee, 0)
                }
            });

        } else {
            // Last 30 days
            const today = new Date();
            const last30Days = eachDayOfInterval({
                start: subDays(today, 29),
                end: today
            }).map(d => ({
                label: format(d, "MMM dd"),
                date: d,
                revenue: 0,
                fees: 0
            }));

            const startDate = startOfDay(subDays(today, 29));

            const orders = await prisma.order.findMany({
                where: {
                    createdAt: { gte: startDate },
                    status: "COMPLETED"
                },
                select: {
                    createdAt: true,
                    totalAmount: true,
                    serviceFee: true
                }
            });

            orders.forEach(order => {
                const label = format(order.createdAt, "MMM dd");
                const dayParam = last30Days.find(d => d.label === label);
                if (dayParam) {
                    dayParam.revenue += order.totalAmount;
                    dayParam.fees += order.serviceFee;
                }
            });

            return NextResponse.json({
                data: last30Days.map(({ label, revenue, fees }) => ({ name: label, total: revenue, profit: fees })),
                summary: {
                    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    totalFees: orders.reduce((sum, o) => sum + o.serviceFee, 0)
                }
            });
        }

    } catch (error) {
        console.error("Revenue analytics error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
