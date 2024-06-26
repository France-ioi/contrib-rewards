import {Metadata} from "next";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/app/lib/auth";
import {fetchDonations} from "@/app/lib/data/donations";
import Donation from "@/app/ui/donation/donation";

export const metadata: Metadata = {
  title: 'Donations',
};

export default async function Page() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return (
      <main className="container mx-auto px-4">
        <div>Empty state</div>
      </main>
    );
  }

  const donations = await fetchDonations(user);

  return (
    <SessionProvider session={session}>
      <main className="container mx-auto px-4">
        <div>layers</div>

        <h2 className="text-4xl mb-8">
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
      </main>
    </SessionProvider>
  );
}
