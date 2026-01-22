import { clamp } from "../utils/time.js";

/**
 * Locked rules:
 * - Monthly salary / 30 = daily pay
 * - daily / 10 = normal hourly
 * - OT = normal * 1.5
 * - Rejected leave = 100 SAR deduction each
 */
export function salaryParams(monthlySalary) {
  const dailyPay = monthlySalary / 30;
  const normalHourly = dailyPay / 10;
  const otHourly = normalHourly * 1.5;
  return { dailyPay, normalHourly, otHourly };
}

export function computeBasePayForAttendance(monthlySalary, workedMs) {
  // base pay is proportional to hours up to 10 hours max (locked daily working hours)
  const { normalHourly } = salaryParams(monthlySalary);
  const hours = clamp(workedMs / (1000 * 60 * 60), 0, 10);
  return Number((hours * normalHourly).toFixed(2));
}

export function computeOtPay(monthlySalary, otMs) {
  const { otHourly } = salaryParams(monthlySalary);
  const hours = clamp(otMs / (1000 * 60 * 60), 0, 4);
  return Number((hours * otHourly).toFixed(2));
}
