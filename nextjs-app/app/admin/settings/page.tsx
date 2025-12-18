"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: "GigStream",
        platformFeePercent: 10,
        maintenanceMode: false
    });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setSettings({
                        siteName: data.siteName || "GigStream",
                        platformFeePercent: data.platformFeePercent || 10,
                        maintenanceMode: data.maintenanceMode || false
                    });
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (!res.ok) throw new Error("Failed to save");
            alert("Settings saved successfully!");
        } catch (error) {
            alert("Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site Name
                        </label>
                        <input
                            type="text"
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Platform Fee (%)
                        </label>
                        <input
                            type="number"
                            name="platformFeePercent"
                            value={settings.platformFeePercent}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Percentage taken from each order total.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="maintenanceMode"
                            name="maintenanceMode"
                            checked={settings.maintenanceMode}
                            onChange={handleChange}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                        />
                        <label htmlFor="maintenanceMode" className="block text-sm font-medium text-gray-900 cursor-pointer">
                            Enable Maintenance Mode
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 -mt-4 pl-12">
                        If enabled, only admins can access the site.
                    </p>

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
