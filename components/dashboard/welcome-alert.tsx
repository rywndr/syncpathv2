import { CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WelcomeAlertProps {
    userName?: string;
}

export function WelcomeAlert({ userName }: WelcomeAlertProps) {
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
