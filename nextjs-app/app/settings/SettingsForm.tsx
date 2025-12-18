"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, Upload, User as UserIcon } from "lucide-react";
import Image from "next/image";

const schema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    bio: z.string().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    languages: z.string().optional().or(z.literal("")),
    skills: z.string().optional().or(z.literal("")),
    avatar: z.string().optional(),
});

type SettingsValues = z.infer<typeof schema>;

export default function SettingsForm({ user }: { user: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: user.fullName || "",
            bio: user.bio || "",
            location: user.location || "",
            languages: user.languages || "",
            skills: user.skills || "",
            avatar: user.avatar || "",
        }
    });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setAvatarUrl(data.url);
            setValue("avatar", data.url);
        } catch (error) {
            console.error(error);
            alert("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: SettingsValues) => {
        setIsLoading(true);
        setSuccess(false);

        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            setSuccess(true);
            router.refresh();

            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-2">
                    <span className="font-bold">✓</span>
                    Profile updated successfully!
                </div>
            )}

            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                    {avatarUrl ? (
                        <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                        <UserIcon size={40} className="text-gray-400" />
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" />
                        </div>
                    )}
                </div>
                <div>
                    <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
                        <Upload size={16} />
                        Change Avatar
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="label">Full Name</label>
                    <input {...register("fullName")} className="input-field w-full p-2 border rounded" />
                    {errors.fullName && <p className="error-text text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="label">Bio</label>
                    <textarea {...register("bio")} className="input-field w-full p-2 border rounded" rows={4} />
                    {errors.bio && <p className="error-text text-red-500 text-sm mt-1">{errors.bio.message}</p>}
                </div>

                <div>
                    <label className="label">Location</label>
                    <input {...register("location")} className="input-field w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="label">Languages (comma separated)</label>
                    <input {...register("languages")} className="input-field w-full p-2 border rounded" placeholder="English, Spanish" />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="label">Skills (comma separated)</label>
                    <input {...register("skills")} className="input-field w-full p-2 border rounded" placeholder="React, Design, Writing" />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
