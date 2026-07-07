"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/plans", label: "计划", icon: ListChecks },
  { href: "/review", label: "复盘", icon: RotateCcw },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-md grid-cols-3 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
                isActive && "text-primary",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
