import {Metadata} from "next";
import {fetchContributions} from "@/app/lib/data/contributions";
import Contribution from "@/app/ui/contribution/contribution";

export const metadata: Metadata = {
  title: 'Contributions',
};

export default async function Page() {
  const contributions = await fetchContributions();

  return (
    <main className="container mx-auto px-4">
      <div className="w-full flex flex-col gap-6">
        {contributions.map(contribution =>
          <Contribution
            key={contribution.id}
            contribution={contribution}
          />
        )}
      </div>
    </main>
  );
}
