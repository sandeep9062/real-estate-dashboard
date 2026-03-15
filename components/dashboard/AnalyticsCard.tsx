import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  delay?: number;
}

export default function AnalyticsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  gradient = "from-blue-500 to-purple-600",
  delay = 0
}: AnalyticsCardProps) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-bounce-in"
          style={{
            animationDelay: `${delay}ms`,
            animationFillMode: 'both'
          }}>
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
        gradient
      )} />

      {/* Decorative Elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  trendUp ? "bg-green-500" : "bg-red-500"
                )} />
                <p
                  className={cn(
                    "text-sm font-semibold",
                    trendUp ? "text-green-500" : "text-red-500"
                  )}
                >
                  {trend}
                </p>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            "relative rounded-xl p-3 transition-all duration-300 transform group-hover:scale-110",
            `bg-gradient-to-br ${gradient} group-hover:shadow-lg`
          )}>
            <Icon className="h-6 w-6 text-white drop-shadow-md" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
          </div>
        </div>

        {/* Bottom decoration */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
          gradient,
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )} />
      </CardContent>
    </Card>
  );
}
