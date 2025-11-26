import { cacheLife } from "next/cache";

async function getCopyrightYear() {
    "use cache";
    cacheLife("max");
    return new Date().getFullYear();
}

export async function CopyrightYear() {
    const year = await getCopyrightYear();
    return <>{year}</>;
}
