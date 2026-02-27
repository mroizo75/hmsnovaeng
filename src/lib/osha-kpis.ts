/**
 * OSHA Safety KPI Calculations
 * Based on OSHA BLS standard formula: incidents × 200,000 / total hours worked
 * 200,000 = equivalent hours for 100 full-time employees working 40h/week × 50 weeks
 */

export const OSHA_MULTIPLIER = 200_000;

export interface OshaKpiInput {
  totalHoursWorked: number;
  recordableIncidents: number;
  daysAwayRestrictedTransferCases: number;
  lostTimeCases: number;
  totalLostWorkDays: number;
}

export interface OshaKpiResult {
  trir: number;
  dartRate: number;
  ltir: number;
  severityRate: number;
}

export function calculateOshaKpis(input: OshaKpiInput): OshaKpiResult {
  const { totalHoursWorked, recordableIncidents, daysAwayRestrictedTransferCases, lostTimeCases, totalLostWorkDays } =
    input;

  if (totalHoursWorked <= 0) {
    return { trir: 0, dartRate: 0, ltir: 0, severityRate: 0 };
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    trir: round2((recordableIncidents * OSHA_MULTIPLIER) / totalHoursWorked),
    dartRate: round2((daysAwayRestrictedTransferCases * OSHA_MULTIPLIER) / totalHoursWorked),
    ltir: round2((lostTimeCases * OSHA_MULTIPLIER) / totalHoursWorked),
    severityRate: round2((totalLostWorkDays * OSHA_MULTIPLIER) / totalHoursWorked),
  };
}

export interface OshaKpiBenchmark {
  industry: string;
  trir: number;
  dartRate: number;
}

// Bureau of Labor Statistics 2022 averages (selected industries)
export const OSHA_BENCHMARKS: OshaKpiBenchmark[] = [
  { industry: "All Private Industry", trir: 2.7, dartRate: 1.5 },
  { industry: "Construction", trir: 2.9, dartRate: 1.4 },
  { industry: "Manufacturing", trir: 3.4, dartRate: 1.6 },
  { industry: "Warehousing & Storage", trir: 5.1, dartRate: 3.0 },
  { industry: "Healthcare & Social Assistance", trir: 4.4, dartRate: 2.3 },
  { industry: "Retail Trade", trir: 3.3, dartRate: 1.7 },
  { industry: "Transportation & Warehousing", trir: 4.2, dartRate: 2.4 },
  { industry: "Professional Services", trir: 0.9, dartRate: 0.4 },
];

export function getTrirRating(trir: number, industryBenchmark?: number): "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" {
  const benchmark = industryBenchmark ?? 2.7;
  if (trir === 0) return "EXCELLENT";
  if (trir < benchmark * 0.5) return "EXCELLENT";
  if (trir < benchmark) return "GOOD";
  if (trir < benchmark * 1.5) return "AVERAGE";
  return "POOR";
}

export function getTrirRatingColor(rating: ReturnType<typeof getTrirRating>): string {
  const colors = {
    EXCELLENT: "text-green-700 bg-green-50",
    GOOD: "text-blue-700 bg-blue-50",
    AVERAGE: "text-yellow-700 bg-yellow-50",
    POOR: "text-red-700 bg-red-50",
  };
  return colors[rating];
}

export function formatOshaRate(value: number): string {
  return value.toFixed(2);
}
