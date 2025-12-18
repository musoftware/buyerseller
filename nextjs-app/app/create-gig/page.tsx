"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

// Schema
const gigSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().optional(),
    tags: z.string().min(1, "Tags are required (comma separated)"),
    description: z.string().min(100, "Description must be at least 100 characters"),
    requirements: z.string().optional(),
    packages: z.array(z.object({
        name: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.coerce.number().min(5),
        deliveryTime: z.string(),
        revisions: z.coerce.number().min(0),
        features: z.string()
    }))
});

export default function CreateGigPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(gigSchema),
        defaultValues: {
            packages: [
                { name: "BASIC", title: "", description: "", price: 0, deliveryTime: "3_DAYS", revisions: 0, features: "" },
                { name: "STANDARD", title: "", description: "", price: 0, deliveryTime: "5_DAYS", revisions: 0, features: "" },
                { name: "PREMIUM", title: "", description: "", price: 0, deliveryTime: "7_DAYS", revisions: 0, features: "" },
            ],
            tags: "",
            requirements: "",
        }
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const urls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Upload failed");

                const data = await res.json();
                urls.push(data.url);
            }
            setUploadedImages(prev => [...prev, ...urls]);
        } catch (error) {
            console.error(error);
            alert("Image upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: any) => {
        if (uploadedImages.length === 0) {
            alert("Please upload at least one image");
            return;
        }

        setIsLoading(true);
        try {
            const formattedData = {
                ...data,
                tags: data.tags.split(",").map((t: string) => t.trim()),
                requirements: data.requirements.split(",").map((t: string) => t.trim()),
                packages: data.packages.map((p: any) => ({
                    ...p,
                    features: p.features.split(",").map((f: string) => f.trim())
                })),
                images: uploadedImages,
                slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()
            };

            const res = await fetch("/api/gigs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedData)
            });

            if (!res.ok) throw new Error("Failed to create gig");

            router.push("/dashboard/gigs");
            router.refresh();

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a New Gig</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">

                    {/* Overview */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">1. Overview</h2>
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gig Title</label>
                                <input {...register("title")} className="input-field w-full p-3 border rounded-lg" placeholder="I will do something amazing..." />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title.message as string}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select {...register("category")} className="input-field w-full p-3 border rounded-lg">
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-sm">{errors.category.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                    <input {...register("subcategory")} className="input-field w-full p-3 border rounded-lg" placeholder="Optional" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input {...register("tags")} className="input-field w-full p-3 border rounded-lg" placeholder="design, logo, art" />
                                {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message as string}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">2. Images</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gig Images</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white">
                                    <Upload size={20} />
                                    <span>Select Images</span>
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                {isUploading && <Loader2 className="animate-spin text-emerald-600" />}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {uploadedImages.map((url, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                                        <img src={url} alt="Uploaded" className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">3. Pricing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {["BASIC", "STANDARD", "PREMIUM"].map((pkgName, index) => (
                                <div key={pkgName} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                                    <h3 className="font-bold text-center">{pkgName}</h3>
                                    <input type="hidden" {...register(`packages.${index}.name` as any)} value={pkgName} />
                                    <input {...register(`packages.${index}.title` as any)} placeholder="Package Name" className="w-full p-2 border rounded" />
                                    <textarea {...register(`packages.${index}.description` as any)} placeholder="Description" className="w-full p-2 border rounded" rows={2} />
                                    <div className="flex gap-2">
                                        <input {...register(`packages.${index}.price` as any)} type="number" placeholder="Price ($)" className="w-full p-2 border rounded" />
                                        <input {...register(`packages.${index}.deliveryTime` as any)} placeholder="Del. Days (3_DAYS)" className="w-full p-2 border rounded" />
                                    </div>
                                    <input {...register(`packages.${index}.features` as any)} placeholder="Features (comma sep)" className="w-full p-2 border rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">4. Description</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea {...register("description")} className="input-field w-full p-3 border rounded-lg" rows={6} placeholder="Describe your gig..." />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                            <textarea {...register("requirements")} className="input-field w-full p-3 border rounded-lg" rows={2} placeholder="What do you need from the buyer?" />
                        </div>
                    </div>

                    {/* Publish */}
                    <div className="pt-6 border-t">
                        <button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Publish Gig"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
