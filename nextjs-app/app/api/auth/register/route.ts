import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or username already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                username: validatedData.username,
                fullName: validatedData.fullName,
                name: validatedData.fullName, // Sync for NextAuth
                password: hashedPassword,
                role: validatedData.role,
                languages: "",
                skills: "",
            },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        });

        // Create wallet for sellers
        if (validatedData.role === "SELLER") {
            await prisma.wallet.create({
                data: {
                    userId: user.id,
                },
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                user,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation error", details: (error as any).errors }, { status: 400 });
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
