import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden h-full min-h-screen lg:block">
                <div className="absolute inset-0 right-4 overflow-hidden rounded-r-4xl shadow-2xl shadow-blue-900/20">
                    <Image
                        src="/auth-bg.jpg"
                        alt="Blue sky with clouds"
                        fill
                        className="object-cover"
                        priority
                        sizes="50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-blue-900/50 to-transparent" />

                    <div className="absolute top-6 right-6">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                        >
                            <Link href="/">
                                <ArrowLeft className="size-4" />
                                Back to home
                            </Link>
                        </Button>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                        <blockquote className="text-white">
                            <p className="text-lg font-medium leading-relaxed">
                                &ldquo;Syncpath.&rdquo;
                            </p>
                            <footer className="mt-4 text-sm text-white/80">
                                — Roy, Mizu and the production team
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 lg:hidden">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Link href="/">
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-center p-8">
                {children}
            </div>
        </div>
    );
}
