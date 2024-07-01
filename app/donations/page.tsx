import {Metadata} from "next";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/app/lib/auth";
import {fetchDonations, getUserDonationStats} from "@/app/lib/data/donations";
import Donation from "@/app/ui/donation/donation";
import UserStats from "@/app/ui/user-stats";
import config from "@/app/lib/config";
import ClockIcon from "@/public/icons/clock.svg";
import DonationIcon from "@/public/icons/donation.svg";
import MedalIcon from "@/public/icons/medal.svg";
import {uppercaseFirst} from "@/app/lib/helpers";
import NonLoggedState from "@/app/ui/non-logged-state";

export const metadata: Metadata = {
  title: 'Donations',
};

export default async function DonationsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <main className="container mx-auto px-4">
        <NonLoggedState
          label="to see your donations"
        />
      </main>
    );
  }

  const donations = await fetchDonations(user);
  const userDonationStats = await getUserDonationStats(user);

  return (
    <SessionProvider session={session}>
      <main className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-2">
          <UserStats
            icon={ClockIcon}
            label={`${uppercaseFirst(config.donationPeriodLabel)}, you've donated`}
            value={`${userDonationStats.periodAmount}${config.currency}`}
          />

          {userDonationStats.firstDonationDate && <UserStats
            icon={DonationIcon}
            label={`Since ${userDonationStats.firstDonationDate.toLocaleString('en', {month: 'long'})} ${userDonationStats.firstDonationDate.getFullYear()}, you've donated`}
            value={`${userDonationStats.totalAmount}${config.currency}`}
          />}

          <UserStats
            icon={MedalIcon}
            label={`Number of current top donation spots you own`}
            value={String(userDonationStats.currentTopDonationSpots)}
          />
        </div>

        {0 < donations.length && <>
          <h2 className="text-4xl mb-8 mt-12">
            Past donations
          </h2>
          <div className="w-full flex flex-col gap-6">
            {donations.map(donation =>
              <Donation
                key={donation.id}
                donation={donation}
              />
            )}
          </div>
        </>
        }
      </main>
    </SessionProvider>
  );
}
