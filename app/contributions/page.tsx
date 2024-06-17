import Image from "next/image";
import {Metadata} from "next";
import {fetchContributions} from "@/app/lib/data/contributions";

export const metadata: Metadata = {
  title: 'Contributions',
};

export default async function Page() {
  const contributions = await fetchContributions();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {JSON.stringify(contributions)}
    </main>
  );
}
