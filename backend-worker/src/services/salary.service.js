export function salaryParams(monthlySalary) {
  const dailyPay = monthlySalary / 30;
  const normalHourly = dailyPay / 10;
  const otHourly = normalHourly * 1.5;
  return { dailyPay, normalHourly, otHourly };
}

export function computeBasePayForAttendance(monthlySalary, workedMs) {
  const { normalHourly } = salaryParams(monthlySalary);
  const hours = Math.max(0, Math.min(10, workedMs / (1000 * 60 * 60)));
  return Number((hours * normalHourly).toFixed(2));
}

export function computeOtPay(monthlySalary, otMs) {
  const { otHourly } = salaryParams(monthlySalary);
  const hours = Math.max(0, Math.min(4, otMs / (1000 * 60 * 60)));
  return Number((hours * otHourly).toFixed(2));
}
