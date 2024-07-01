import {Metadata} from "next";
import {fetchMergeRequests} from "@/app/lib/data/contributions";
import Contribution from "@/app/ui/contribution/contribution";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/app/lib/auth";
import UserStats from "@/app/ui/user-stats";
import ClockIcon from "@/public/icons/clock.svg";
import config from "@/app/lib/config";
import DonationIcon from "@/public/icons/donation.svg";
import {getAuthorStats} from "@/app/lib/data/author";
import NonLoggedState from "@/app/ui/non-logged-state";
import {UiButton} from "@/app/ui/button";
import ClaimButton from "@/app/ui/claim-button";

export const metadata: Metadata = {
  title: 'Author',
};

export default async function AuthorPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return (
      <main className="container mx-auto px-4">
        <NonLoggedState
          label="to see your merges"
        />
      </main>
    );
  }

  const contributions = await fetchMergeRequests(user.id);
  const authorStats = await getAuthorStats(user);

  return (
    <SessionProvider session={session}>
      <main className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-2">
          <UserStats
            icon={ClockIcon}
            label={`Unclaimed donations`}
            value={
              <div className="flex gap-6 items-center">
                <div className={`${0 < authorStats.totalUnclaimedAmount ? 'bg-clip-text bg-gradient-to-r text-transparent from-[#0F61FF] to-[#E01AFF] leading-[4rem]' : ''}`}>
                  {authorStats.totalUnclaimedAmount}{config.currency}
                </div>

                {0 < authorStats.totalUnclaimedAmount && <ClaimButton/>}
              </div>
            }
          />

          {authorStats.firstDonationReceivedDate && <UserStats
            icon={DonationIcon}
            label={`Since ${authorStats.firstDonationReceivedDate.toLocaleString('en', {month: 'long'})} ${authorStats.firstDonationReceivedDate.getFullYear()}, you've received`}
            value={`${authorStats.totalAmount}${config.currency}`}
          />}
        </div>

        <h2 className="text-4xl mb-8 mt-12">
          Your merges
        </h2>

        <div className="w-full flex flex-col gap-6">
          {contributions.map(contribution =>
            <Contribution
              key={contribution.id}
              mergeRequest={contribution}
            />
          )}
        </div>
      </main>
    </SessionProvider>
);
}
