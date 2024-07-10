import {Metadata} from "next";
import {fetchMergeRequests} from "@/app/lib/data/contributions";
import Contribution from "@/app/ui/contribution/contribution";
import {auth} from "@/app/lib/auth";
import UserStats from "@/app/ui/user-stats";
import PiggyBankIcon from "@/public/icons/piggy_bank.svg";
import config from "@/app/lib/config";
import DonationIcon from "@/public/icons/donation.svg";
import {getAuthorStats} from "@/app/lib/data/author";
import NonLoggedState from "@/app/ui/non-logged-state";
import dynamic from "next/dynamic";
import {Spinner} from "@nextui-org/spinner";

export const metadata: Metadata = {
  title: 'Author',
};

const ClaimButton = dynamic(() => import("@/app/ui/claim-button"), {
  loading: () => <div className="flex gap-6 items-center">
    <div>
      <Spinner/>
    </div>
  </div>,
  ssr: false,
});

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
    <main className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-2">
        <UserStats
          icon={PiggyBankIcon}
          label={`Unclaimed donations`}
          value={
            <ClaimButton/>
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
  );
}
