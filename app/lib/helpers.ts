// Lead amount is next integer
import config from "@/app/lib/config";

export function getLeadAmountFromCurrentAmount(currentAmount: number) {
  return Math.ceil(currentAmount + 0.0001);
}

export function getCurrentPeriodData() {
  const today = new Date();
  const quarter = Math.floor((today.getMonth() / config.donationPeriodMonths));

  const periodStart = new Date(today.getFullYear(), quarter * config.donationPeriodMonths, 1);
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + config.donationPeriodMonths, 0);

  const timeToEnd = Math.round((periodEnd.getTime() - (new Date()).getTime()) / 1000); // secs
  const periodTotalTime = Math.round((periodEnd.getTime() - periodStart.getTime()) / 1000); // secs

  return {
    periodStart,
    periodEnd,
    timeToEnd,
    periodTotalTime,
    periodPercentage: 1 - timeToEnd / periodTotalTime,
  }
}