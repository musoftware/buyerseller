import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = forgotPasswordSchema.parse(body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link.",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Store token in verification_tokens table
        await prisma.verificationToken.create({
            data: {
                identifier: email.toLowerCase(),
                token: resetToken,
                expires: resetTokenExpiry,
            },
        });

        // TODO: Send email with reset link
        // In production, use Resend, SendGrid, or similar
        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

        console.log("Password reset link:", resetUrl);
        console.log("This would be sent to:", email);

        // For now, we'll just log it. In production, send via email service:
        /*
        await resend.emails.send({
            from: 'GigStream <noreply@gigstream.com>',
            to: email,
            subject: 'Reset Your Password',
            html: `
                <h1>Reset Your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        });
        */

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error in forgot password:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
