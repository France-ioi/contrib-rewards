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

export function uppercaseFirst(text: string) {
  if (!text) {
    return text;
  }

  return text.substring(0, 1).toLocaleUpperCase() + text.substring(1);
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
  }

  document.body.removeChild(textArea);
}

export async function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }

  await navigator.clipboard.writeText(text);
}
