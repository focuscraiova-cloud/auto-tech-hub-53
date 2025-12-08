import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { strength, passedRequirements } = useMemo(() => {
    const passed = requirements.filter((req) => req.test(password));
    const strengthScore = passed.length / requirements.length;
    
    let strength: "weak" | "medium" | "strong" = "weak";
    if (strengthScore >= 0.8) strength = "strong";
    else if (strengthScore >= 0.6) strength = "medium";
    
    return { strength, passedRequirements: passed.length };
  }, [password]);

  if (!password) return null;

  const strengthColors = {
    weak: "bg-destructive",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthLabels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            "font-medium",
            strength === "weak" && "text-destructive",
            strength === "medium" && "text-yellow-500",
            strength === "strong" && "text-green-500"
          )}>
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              strengthColors[strength]
            )}
            style={{ width: `${(passedRequirements / requirements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid gap-1">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                passed ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {passed ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  const passedCount = requirements.filter((req) => req.test(password)).length;
  
  if (passedCount < 4) {
    return {
      isValid: false,
      message: "Password must meet at least 4 of the 5 requirements",
    };
  }
  
  return { isValid: true, message: "" };
}
