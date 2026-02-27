"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  AlertCircle,
  Beaker,
  ClipboardList,
  GraduationCap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  timeRegistrationEnabled: boolean;
}

const navItems = [
  { href: "/ansatt", label: "Home", icon: Home, exact: true },
  { href: "/ansatt/dokumenter", label: "Docs", icon: FileText },
  { href: "/ansatt/avvik", label: "Report", icon: AlertCircle },
  { href: "/ansatt/stoffkartotek", label: "Hazmat", icon: Beaker },
  { href: "/ansatt/skjemaer", label: "Forms", icon: ClipboardList },
  { href: "/ansatt/opplaering", label: "Training", icon: GraduationCap },
];

export function BottomNav({ timeRegistrationEnabled }: BottomNavProps) {
  const pathname = usePathname();

  const items = timeRegistrationEnabled
    ? [...navItems, { href: "/ansatt/timeregistrering", label: "Hours", icon: Clock }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <Icon
                className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-500")}
              />
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
