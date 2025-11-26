export function AuthDivider() {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
                <span className="bg-background text-muted-foreground px-2">
                    or continue with
                </span>
            </div>
        </div>
    );
}
