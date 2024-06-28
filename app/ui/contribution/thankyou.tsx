import {DonationFull} from "@/app/lib/definitions";
import config from "@/app/lib/config";
import {useState} from "react";
import UserAvatar from "@/app/ui/user-avatar";
import {useSession} from "next-auth/react";
import {UiButton} from "@/app/ui/button";
import {submitReview} from "@/app/lib/data/donations";

export default function ThankYou({donation, onSentReview}: {donation: DonationFull, onSentReview: (review: string) => void}) {
  const [review, setReview] = useState("");

  const {data: session} = useSession();
  const user = session?.user!;

  const sendReview = async () => {
    await submitReview(donation.id, review);
    onSentReview(review);
  };

  return (
    <div>
      <h2 className="text-2xl md:text-4xl text-project-focus mb-6">
        Thank you for supporting your community!
      </h2>

      <p className="md:text-xl text-light">
        You just sent {Number(donation.amount)}{config.currency} to the
        author{donation.mergeRequest.authors.length > 1 ? 's' : ''} of the merge titled
        “{donation.mergeRequest.title}”.
      </p>

      <p className="text-[#22272E] text-xl md:text-2xl mt-6">
        Before you go, please leave a review on the merge below!
      </p>

      <div className="mt-4 relative">
        <textarea
          className="rounded-lg border border-[#E5E5E5] text-light w-full p-4 h-[100px]"
          placeholder="Type your review here..."
          value={review}
          onChange={(event) => setReview(event.target.value)}
        />
        {/*<div*/}
        {/*  className="absolute bottom-[0px] left-[18px]"*/}
        {/*>*/}
        {/*  <Image*/}
        {/*    width={12}*/}
        {/*    height={12}*/}
        {/*    src={TriangleDownIcon}*/}
        {/*    alt="Triangle"*/}
        {/*  />*/}
        {/*</div>*/}
      </div>

      <div className="flex gap-3 items-center mt-1">
        <UserAvatar user={user} size={50}/>
        <div>
          <div className="md:text-2xl font-bold">
            {user.name}
          </div>
          <div className="text-action md:text-xl">
            {Number(donation.amount)}{config.currency}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <UiButton
          color="primary"
          className="w-full rounded-full bg-[#0F61FF] font-medium"
          onClick={sendReview}
        >
          Submit review
        </UiButton>
      </div>
    </div>
  );
}
