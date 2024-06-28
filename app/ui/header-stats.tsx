import {getDonationStats} from "@/app/lib/data/donations";
import config from "@/app/lib/config";
import Image from "next/image";
import ClockIcon from "@/public/icons/clock.svg";
import {getCurrentPeriodData} from "@/app/lib/helpers";

export default async function HeaderStats() {
  const donationStats = await getDonationStats();

  const periodData = getCurrentPeriodData();
  const days = Math.floor(periodData.timeToEnd / 86400);
  const remaining = periodData.timeToEnd - days * 86400;
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining - hours * 3600) / 60);

  const targetPercentage = 25 + Math.min(100, Math.max(0, donationStats.amount / config.donationTarget * 75));
  const displayedTargetPercentage = Math.max(0, Math.min(100, Math.round(targetPercentage)));

  return (
    <section className="container mx-auto px-4 my-12 md:my-20">
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
        <h1 className="basis-1/2 bg-clip-text bg-gradient-to-b text-transparent from-[#0F61FF] to-[#A32FB5] text-3xl md:text-6xl font-medium leading-9 md:leading-[70px]">
          We have raised {donationStats.amount} out of {config.donationTarget}{config.currency} target {config.donationPeriodLabel}.
        </h1>
        <div className="basis-1/2 flex items-center justify-center">
          <div className="max-w-[500px] w-full">
            <div className="rounded-full bg-actions-hover relative h-[50px] md:h-[70px]">
              <div
                className="z-[1] shadow-progress rounded-full h-full relative bg-gradient-to-r from-[#AF2BAF] to-[#0F61FF]"
                style={{width: displayedTargetPercentage + '%'}}>
                <div
                  className="text-white text-2xl absolute left-4 md:left-6 top-0 bottom-0 flex items-center font-bold text-[27px] md:text-[34px]">
                  {config.currency}
                </div>
                <div
                  className="text-white text-2xl absolute right-4 top-0 bottom-0 flex items-center font-bold text-[27px] md:text-[34px]">
                  {donationStats.amount}
                </div>
              </div>

              <div
                className="text-white text-2xl absolute right-4 md:right-6 opacity-30 top-0 bottom-0 flex items-center font-bold text-[27px] md:text-[34px]">
                {config.donationTarget}
              </div>
            </div>

            <div className="mt-6 flex gap-3 md:gap-5 items-center px-6">
              <Image
                width={48}
                height={48}
                src={ClockIcon}
                alt="Clock"
                className="w-[24px] h-[24px] md:w-[48px] md:h-[48px]"
              />

              <div className="grow h-[8px] rounded-full bg-[#1A5DF9]">
                <div className="h-full rounded-full bg-[#E01AFF]"
                     style={{width: Math.round(periodData.periodPercentage * 100) + '%'}}>
                </div>
              </div>

              <div className="font-bold text-lg md:text-2xl text-light text-nowrap">
                {days} day{days > 1 ? 's' : ''}, {hours} h {String(minutes).padStart(2, '0')} min
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
