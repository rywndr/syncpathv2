import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
    return (
        <section className="border-t bg-muted/30 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 to-cyan-500 px-6 py-16 text-center text-white shadow-2xl sm:px-16 sm:py-20">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%)] bg-size-[64px_64px]" />
                    </div>

                    <div className="relative">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Ready to get started?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                            Join the teams already using Syncpath to manage
                            their projects effectively.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                            >
                                <Link href="/sign-up">
                                    Create Account
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
