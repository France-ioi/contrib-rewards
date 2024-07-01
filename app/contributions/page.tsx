import {Metadata} from "next";
import {fetchMergeRequests} from "@/app/lib/data/contributions";
import Contribution from "@/app/ui/contribution/contribution";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/app/lib/auth";

export const metadata: Metadata = {
  title: 'Contributions',
};

export default async function ContributionsPage() {
  const session = await auth();

  const contributions = await fetchMergeRequests();

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
