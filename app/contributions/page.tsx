import {Metadata} from "next";
import {fetchMergeRequests} from "@/app/lib/data/contributions";
import Contribution from "@/app/ui/contribution/contribution";
import {getCurrentPeriodData} from "@/app/lib/helpers";

export const metadata: Metadata = {
  title: 'Contributions',
};

export default async function ContributionsPage() {
  const period = getCurrentPeriodData();

  const contributions = await fetchMergeRequests(null, period.periodStart);

  const contributionsBeforePeriod  = contributions
    .filter(contribution => contribution.mergedAt < period.periodStart);

  const contributionsPeriod  = contributions
    .filter(contribution => contribution.mergedAt >= period.periodStart);

  return (
    <main className="container mx-auto px-4">
      <div className="w-full flex flex-col gap-6">
        {contributionsPeriod.map(contribution =>
          <Contribution
            key={contribution.id}
            mergeRequest={contribution}
          />
        )}
      </div>
      <div className="w-full flex flex-col gap-6">
        {contributionsBeforePeriod.map(contribution =>
          <Contribution
            key={contribution.id}
            mergeRequest={contribution}
          />
        )}
      </div>
    </main>
  );
}
