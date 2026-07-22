"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 m-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Beklenmeyen Bir Hata Oluştu</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Görüntülemeye çalıştığınız bileşende sistemsel bir sorun meydana geldi. Lütfen sayfayı yenilemeyi deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-left overflow-auto max-h-40">
                <code className="text-xs text-rose-600 dark:text-rose-400 font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <div className="pt-4">
              <Button onClick={() => window.location.reload()} className="gap-2 w-full sm:w-auto">
                <RefreshCcw className="w-4 h-4" />
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
