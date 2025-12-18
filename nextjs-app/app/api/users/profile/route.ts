import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
    fullName: z.string().min(2).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().optional(),
    languages: z.string().optional(), // Comma separated for simplicity in this MVP
    skills: z.string().optional(),
    avatar: z.string().optional(),
    // socialLinks...
});

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                fullName: validatedData.fullName,
                name: validatedData.fullName, // Sync
                bio: validatedData.bio,
                location: validatedData.location,
                languages: validatedData.languages, // Stored as string in SQLite schema
                skills: validatedData.skills,
                avatar: validatedData.avatar,
                image: validatedData.avatar, // Sync with NextAuth image
            },
        });

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Profile update error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

