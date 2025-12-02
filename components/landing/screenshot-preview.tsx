"use client";

import { useState } from "react";
import Image from "next/image";

export function ScreenshotPreview() {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative aspect-video bg-muted">
            {!imageError && (
                <Image
                    src="/workspace-screenshot.png"
                    alt="Syncpath Workspace"
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                />
            )}
            {imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground p-8">
                        <p className="text-lg font-medium">
                            [Workspace Screenshot]
                        </p>
                        <p className="mt-2 text-sm">
                            Gantt chart + Task list in one view
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
