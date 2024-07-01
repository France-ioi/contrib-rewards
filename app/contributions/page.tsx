import {Metadata} from "next";
import {fetchMergeRequests} from "@/app/lib/data/contributions";
import Contribution from "@/app/ui/contribution/contribution";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/app/lib/auth";
import config from "@/app/lib/config";

export const metadata: Metadata = {
  title: 'Contributions',
};

export default async function ContributionsPage() {
  const session = await auth();

  const mergedAfter = new Date(new Date().getTime() - config.contributionsDisplayLastMonths * 30 * 86400 * 1000);

  const contributions = await fetchMergeRequests(null, mergedAfter);

  return (
    <SessionProvider session={session}>
      <main className="container mx-auto px-4">
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
