"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  AlertCircle,
  GraduationCap,
  ClipboardCheck,
  ListTodo,
  Target,
  Settings,
  LogOut,
  ClipboardList,
  Beaker,
  ShieldCheck,
  FileBarChart,
  Calendar,
  Leaf,
  Layers,
  HeartPulse,
  LifeBuoy,
  MessageSquare,
  Sparkles,
  Zap,
  ListChecks,
  Clock,
  Scale,
  HardHat,
  Flame,
  Lock,
  Users,
  DoorOpen,
  Droplets,
  Stethoscope,
  TrendingUp,
  ClipboardSignature,
  ShieldAlert,
  BookOpen,
  Truck,
  FlaskConical,
  MapPin,
  ShieldCheck as ShieldCheckIcon,
  BarChart3,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { getRoleDisplayName } from "@/lib/permissions";
import Image from "next/image";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useSimpleMode } from "@/hooks/use-simple-mode";
import { useSimpleMenuConfig } from "@/hooks/use-simple-menu-config";
import { TenantSwitcher } from "@/components/auth/tenant-switcher";

const navItems = [
  // === CORE EHS (simple mode) ===
  { href: "/dashboard",                       label: "nav.dashboard",            icon: LayoutDashboard,   permission: "dashboard"         as const, simple: true },
  { href: "/dashboard/incidents",             label: "nav.incidents",            icon: AlertCircle,       permission: "incidents"         as const, simple: true },
  { href: "/dashboard/inspections",           label: "nav.inspections",          icon: ShieldCheck,       permission: "inspections"       as const, simple: true },
  { href: "/dashboard/actions",               label: "nav.actions",              icon: ListTodo,          permission: "actions"           as const, simple: true },
  { href: "/dashboard/training",              label: "nav.training",             icon: GraduationCap,     permission: "training"          as const, simple: true },
  { href: "/dashboard/chemicals",             label: "nav.chemicals",            icon: Beaker,            permission: "chemicals"         as const, simple: true },
  { href: "/dashboard/documents",             label: "nav.documents",            icon: FileText,          permission: "documents"         as const, simple: true },

  // === OSHA COMPLIANCE (simple mode) ===
  { href: "/dashboard/osha",                  label: "nav.oshaRecordkeeping",    icon: ClipboardSignature,permission: "incidents"         as const, simple: true },
  { href: "/dashboard/eap",                   label: "nav.eap",                  icon: LifeBuoy,          permission: "audits"            as const, simple: true },
  { href: "/dashboard/ppe",                   label: "nav.ppe",                  icon: HardHat,           permission: "incidents"         as const, simple: true },
  { href: "/dashboard/toolbox-talks",         label: "nav.toolboxTalks",         icon: BookOpen,          permission: "incidents"         as const, simple: true },

  // === SAFETY PROGRAMS (advanced) ===
  { href: "/dashboard/loto",                  label: "nav.loto",                 icon: Lock,              permission: "audits"            as const, simple: false },
  { href: "/dashboard/fall-protection",       label: "nav.fallProtection",       icon: ShieldAlert,       permission: "audits"            as const, simple: false },
  { href: "/dashboard/competent-person",      label: "nav.competentPerson",      icon: Users,             permission: "audits"            as const, simple: false },
  { href: "/dashboard/confined-space",        label: "nav.confinedSpace",        icon: DoorOpen,          permission: "audits"            as const, simple: false },
  { href: "/dashboard/bloodborne-pathogen",   label: "nav.bloodbornePathogen",   icon: Droplets,          permission: "audits"            as const, simple: false },

  // === EHS MANAGEMENT (advanced) ===
  { href: "/dashboard/risks",                 label: "nav.risks",                icon: AlertTriangle,     permission: "risks"             as const, simple: false },
  { href: "/dashboard/risk-register",         label: "nav.riskRegister",         icon: Layers,            permission: "risks"             as const, simple: false },
  { href: "/dashboard/forms",                 label: "nav.forms",                icon: ClipboardList,     permission: "forms"             as const, simple: false },
  { href: "/dashboard/audits",                label: "nav.audits",               icon: ClipboardCheck,    permission: "audits"            as const, simple: false },
  { href: "/dashboard/goals",                 label: "nav.goals",                icon: Target,            permission: "goals"             as const, simple: false },
  { href: "/dashboard/annual-safety-program", label: "nav.annualSafetyProgram",  icon: ListChecks,        permission: "annualHmsPlan"     as const, simple: true },
  { href: "/dashboard/management-reviews",    label: "nav.managementReviews",    icon: FileBarChart,      permission: "managementReviews" as const, simple: false },
  { href: "/dashboard/safety-committee",      label: "nav.safetyCommittee",      icon: Calendar,          permission: "meetings"          as const, simple: false },
  { href: "/dashboard/regulatory-register",   label: "nav.regulatoryRegister",   icon: Scale,             permission: "legalRegister"     as const, simple: false },

  // === PHASE 3 — ENTERPRISE (advanced) ===
  { href: "/dashboard/dot",                   label: "nav.dotCompliance",        icon: Truck,             permission: "audits"            as const, simple: false },
  { href: "/dashboard/industrial-hygiene",    label: "nav.industrialHygiene",    icon: FlaskConical,      permission: "audits"            as const, simple: false },
  { href: "/dashboard/insurance",             label: "nav.insurance",            icon: ShieldCheckIcon,   permission: "audits"            as const, simple: false },
  { href: "/dashboard/state-requirements",    label: "nav.stateRequirements",    icon: MapPin,            permission: "legalRegister"     as const, simple: false },
  { href: "/dashboard/safety-insights",       label: "nav.safetyInsights",       icon: BarChart3,         permission: "dashboard"         as const, simple: false },

  // === OPERATIONS (advanced) ===
  { href: "/dashboard/workers-comp",          label: "nav.workersComp",          icon: Stethoscope,       permission: "incidents"         as const, simple: false },
  { href: "/dashboard/environment",           label: "nav.environment",          icon: Leaf,              permission: "environment"       as const, simple: false },
  { href: "/dashboard/wellbeing",             label: "nav.wellbeing",            icon: HeartPulse,        permission: "forms"             as const, simple: false },
  { href: "/dashboard/whistleblowing",        label: "nav.whistleblowing",       icon: MessageSquare,     permission: "whistleblowing"    as const, simple: false },
  { href: "/dashboard/time-registration",     label: "nav.timeRegistration",     icon: Clock,             permission: "timeRegistration"  as const, simple: false },

  // === SETTINGS ===
  { href: "/dashboard/settings",              label: "nav.settings",             icon: Settings,          permission: "settings"          as const, simple: true },
];

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const { data: session } = useSession();
  const { visibleNavItems, role } = usePermissions();
  const { isSimpleMode, toggleMode } = useSimpleMode();
  const { simpleMenuItems } = useSimpleMenuConfig();

  // Filter navigation based on permissions AND simple/advanced mode
  const allowedNavItems = navItems.filter((item) => {
    if (!visibleNavItems[item.permission]) return false;
    if (!isSimpleMode) return true;
    // In simple mode: use tenant config if set, otherwise default (item.simple)
    if (simpleMenuItems !== null && Array.isArray(simpleMenuItems)) {
      return simpleMenuItems.includes(item.href);
    }
    return item.simple;
  });

  const tenantName = session?.user?.tenantName;

  return (
    <aside className="hidden lg:block w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="border-b p-6">
          <div className="flex items-start justify-between mb-2">
            <Image src="/logo-eng.png" alt="HMS Nova" width={155} height={100} />
            <NotificationBell />
          </div>
          {tenantName && (
            <p className="text-sm font-semibold text-foreground mt-3 truncate">
              {tenantName}
            </p>
          )}
          {role && (
            <Badge variant="outline" className="mt-2 text-xs">
              {getRoleDisplayName(role)}
            </Badge>
          )}
          
          {/* Tenant Switcher (only if user has multiple tenants) */}
          <div className="mt-3">
            <TenantSwitcher />
          </div>
        </div>

        {/* Simple/Advanced toggle */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSimpleMode ? (
                <Zap className="h-4 w-4 text-blue-500" />
              ) : (
                <Sparkles className="h-4 w-4 text-purple-500" />
              )}
              <span className="text-xs font-medium">
                {isSimpleMode ? "Simple" : "Advanced"}
              </span>
            </div>
            <Switch
              checked={!isSimpleMode}
              onCheckedChange={() => toggleMode()}
              className="scale-75"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {isSimpleMode
              ? "Core H&S features"
              : "All features incl. ISO"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-green-600 text-white font-medium"
                    : "hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-2 px-3 text-xs text-muted-foreground truncate">
            {session?.user?.name || session?.user?.email}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-3 h-4 w-4" />
            {t("auth.logout")}
          </Button>
        </div>
      </div>
    </aside>
  );
}

