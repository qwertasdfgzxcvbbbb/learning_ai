import type { ReactNode } from "react";
import { Bell, Sparkles } from "lucide-react";
import { APP_NAME, IN_APP_REMINDER_HOUR } from "@/lib/constants";
import { BottomNav } from "@/components/layout/bottom-nav";

type MobileShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function MobileShell({ title = APP_NAME, subtitle, children }: MobileShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{title}</span>
            </div>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
            <Bell className="h-4 w-4" aria-label={`今晚 ${IN_APP_REMINDER_HOUR} 点学习提醒`} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-24 pt-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
