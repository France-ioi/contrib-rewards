import {DonationFull} from "@/app/lib/definitions";
import config from "@/app/lib/config";
import UserAvatar from "@/app/ui/user-avatar";
import {useSession} from "next-auth/react";
import {UiButton} from "@/app/ui/button";
import {copyTextToClipboard} from "@/app/lib/helpers";

export default function ShareReview({donation, review}: {donation: DonationFull, review: string}) {
  const {data: session} = useSession();
  const user = session?.user!;

  const shareDonation = () => {
    copyTextToClipboard(config.webServerUrl);
  };

  return (
    <div>
      <h2 className="text-2xl md:text-4xl text-project-focus mb-6">
        Share your donation and review
      </h2>

      <div className="mt-4 relative">
        <div
          className="rounded-lg text-light w-full p-4 h-[100px] bg-container-grey break-words whitespace-pre-wrap"
        >
          {review}
        </div>
        <div
          className="border-solid border-t-container-grey border-t-[12px] border-x-transparent border-x-[12px] border-b-0 absolute bottom-[-12px] left-[13px]"
        ></div>
      </div>

      <div className="flex gap-3 items-center mt-3">
        <UserAvatar user={user} size={50}/>
        <div>
          <div className="text-2xl font-bold">
            {user.name}
          </div>
          <div className="text-action text-xl">
            {Number(donation.amount)}{config.currency}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <UiButton
          color="primary"
          className="w-full rounded-full bg-[#0F61FF] font-medium"
          onClick={shareDonation}
        >
          Copy link to share!
        </UiButton>
      </div>
    </div>
  );
}
