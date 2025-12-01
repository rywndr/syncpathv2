import { cacheLife } from "next/cache";
import { CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WelcomeAlertProps {
    userName?: string;
}

export async function WelcomeAlert({ userName }: WelcomeAlertProps) {
    "use cache";
    cacheLife("hours");

    return (
        <Alert>
            <CheckCircle className="size-4" />
            <AlertTitle>Welcome{userName ? `, ${userName}` : ""}!</AlertTitle>
            <AlertDescription>
                You have successfully logged in.
            </AlertDescription>
        </Alert>
    );
}
