import { ScreenshotPreview } from "./screenshot-preview";

export function WorkspacePreview() {
    return (
        <div className="relative mt-16 sm:mt-20">
            <div className="relative mx-auto max-w-5xl">
                {/* Glow */}
                <div className="absolute -inset-4 rounded-2xl bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-xl border bg-background shadow-2xl">
                    {/* MacOS Browser mockup */}
                    <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                        <div className="flex gap-1.5">
                            <div className="size-3 rounded-full bg-red-500" />
                            <div className="size-3 rounded-full bg-yellow-500" />
                            <div className="size-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1 text-center">
                            <div className="mx-auto max-w-md rounded-md bg-background px-4 py-1 text-xs text-muted-foreground">
                                syncpath.app/projects/workspace
                            </div>
                        </div>
                    </div>

                    <ScreenshotPreview />
                </div>
            </div>
        </div>
    );
}
