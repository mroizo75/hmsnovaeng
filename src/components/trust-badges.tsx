import { Shield, Users, Award, Lock, CheckCircle2, Globe } from "lucide-react";

interface TrustBadgesProps {
  variant?: "default" | "compact";
  className?: string;
}

export function TrustBadges({ 
  variant = "default",
  className = "" 
}: TrustBadgesProps) {
  const badges = [
    {
      icon: Award,
      title: "ISO 9001 Certified",
      description: "Meets ISO 9001:2015 requirements",
    },
    {
      icon: Lock,
      title: "SOC 2 Compliant",
      description: "Fully security-compliant",
    },
    {
      icon: CheckCircle2,
      title: "OSHA Compliant",
      description: "Meets all EHS requirements",
    },
    {
      icon: Users,
      title: "US Companies",
      description: "Trust EHS Nova",
    },
    {
      icon: Shield,
      title: "US Data Centers",
      description: "Your data stays in the US",
    },
    {
      icon: Globe,
      title: "15 Years Experience",
      description: "EHS expertise since 2009",
    },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-6 ${className}`}>
        {badges.map((badge, i) => (
          <div 
            key={i} 
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <badge.icon className="h-5 w-5 text-primary" />
            <span className="font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ${className}`}>
      {badges.map((badge, i) => (
        <div 
          key={i} 
          className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <badge.icon className="h-10 w-10 text-primary mb-3" />
          <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
