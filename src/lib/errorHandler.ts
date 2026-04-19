import { toast } from "sonner";

/**
 * Centralized error handler
 * Replaces console.error with user-friendly notifications
 */
export class ErrorHandler {
    static handle(error: unknown, context?: string) {
        const message = error instanceof Error ? error.message : String(error);

        // Show toast to user
        toast.error(context || "Bir hata oluştu", {
            description: message,
            duration: 5000,
        });

        // Log to monitoring service (future: Sentry, LogRocket, etc.)
        if (process.env.NODE_ENV === "development") {
            console.error(`[${context}]`, error);
        }
    }

    static handleSupabaseError(error: unknown, operation: string) {
        this.handle(error, `Veritabanı Hatası: ${operation}`);
    }

    static handleNetworkError(error: unknown) {
        toast.error("Bağlantı Hatası", {
            description: "İnternet bağlantınızı kontrol edin",
            duration: 5000,
        });
    }

    static success(message: string, description?: string) {
        toast.success(message, {
            description,
            duration: 3000,
        });
    }
}
