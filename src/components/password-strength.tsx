"use client";

import { useEffect, useState } from "react";

/**
 * Password Strength Indicator
 * 
 * Shows password strength based on complexity.
 */

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: "Very weak",
      color: "bg-destructive",
      suggestions: ["Enter a password"],
    };
  }

  // Length checks
  if (password.length >= 12) score++;
  else suggestions.push("Use at least 12 characters");

  if (password.length >= 16) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++;
  else suggestions.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else suggestions.push("Add numbers");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push("Add special characters (!@#$%^&*)");

  // Bonus for mixing characters
  const charTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (charTypes >= 3 && password.length >= 12) score++;

  // Penalties
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push("Avoid repeated characters (aaa, 111)");
  }

  if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
    score = Math.max(0, score - 1);
  }

  // Common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
  ];
  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    suggestions.push("Avoid common passwords and patterns");
  }

  // Determine label and color
  let label = "";
  let color = "";

  if (score <= 2) {
    label = "Weak";
    color = "bg-destructive";
  } else if (score === 3) {
    label = "Fair";
    color = "bg-orange-500";
  } else if (score === 4) {
    label = "Good";
    color = "bg-yellow-500";
  } else if (score === 5) {
    label = "Strong";
    color = "bg-green-500";
  } else {
    label = "Very strong";
    color = "bg-green-600";
  }

  return { score, label, color, suggestions };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength>(
    calculatePasswordStrength("")
  );

  useEffect(() => {
    setStrength(calculatePasswordStrength(password));
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength:</span>
          <span className={`font-medium ${strength.score >= 4 ? "text-green-600" : "text-orange-600"}`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < strength.score
                  ? strength.color
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && strength.suggestions.length > 0 && strength.score < 5 && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="mb-1 font-medium">Suggestions for improvement:</p>
          <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
            {strength.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
