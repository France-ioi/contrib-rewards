"use client";

import PenIcon from '@/public/icons/pen.svg';
import Image from "next/image";
import ContributionModal from "@/app/ui/contribution/contribution-modal";
import {useState} from "react";
import {UiButton} from "@/app/ui/button";
import {useSession} from "next-auth/react";
import {signIn} from "next-auth/react";
import {DonationFull} from "@/app/lib/definitions";
import {getLeadAmountFromCurrentAmount} from "@/app/lib/helpers";
import {inter} from "@/app/ui/fonts";
import config from "@/app/lib/config";
import UserAvatar from "@/app/ui/user-avatar";
import {useRouter} from "next/navigation";

interface DonationProps {
  donation: DonationFull,
}

export default function Donation({donation}: DonationProps) {
  const {data: session} = useSession();
  const router = useRouter();

  const [initDonation, setInitDonation] = useState<DonationFull|null>(null);
  const [initReview, setInitReview] = useState<string|null>(null);

  const bestDonation = donation.mergeRequest.donations.length ? donation.mergeRequest.donations[0] : null;
  const leadAmount = bestDonation ? getLeadAmountFromCurrentAmount(bestDonation.amount as unknown as number) : null;
  const isBestDonation = null !== bestDonation && bestDonation.donorId === session?.user?.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [givenAmount, setGivenAmount] = useState<number|null>(null);

  const openGiveModal = async (amount: number|null) => {
    if (!session?.user) {
      signIn('france-ioi');
      return;
    }

    setModalOpen(true);
    setInitDonation(null);
    setInitReview(null);
    setGivenAmount(amount);
  };

  const openShareReview = () => {
    if (!session?.user) {
      signIn('france-ioi');
      return;
    }

    setModalOpen(true);
    setInitDonation(donation);
    setInitReview(donation.review);
  };

  return (
    <div className="rounded-lg shadow-card w-full p-4 bg-white">
      <ContributionModal
        mergeRequest={donation.mergeRequest}
        amount={givenAmount}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDonated={() => router.refresh()}
        initDonation={initDonation}
        initReview={initReview}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div>
          <header className="flex gap-3 items-start">
            <h3 className="text-3xl">
              {donation.mergeRequest.title}
            </h3>
          </header>
          <div className="flex flex-col md:flex-row mt-6 gap-6">
            <div className="bg-container-grey rounded-lg p-4 grow max-w-[500px]">
              <p className="text-xl">
                You gave to this merge
              </p>
              <p className={`font-bold text-project-focus text-6xl md:text-9xl text-center mt-12 mb-12 px-6 ${inter.className}`}>
                {donation.amount.toString()}<span className="text-7xl">{config.currency}</span>
              </p>
              <div className="text-light text-center">
                <UiButton
                  color="outlined"
                  className="flex-grow w-full"
                  onClick={() => openGiveModal(null)}
                >
                  Donate more
                </UiButton>
              </div>
            </div>
            {donation.splits.length > 1 && <div className="grow p-4">
              <p className="text-light text-xl mb-6">How you split your donation</p>

              <div className="flex flex-col gap-4">
                {donation.splits.map(split =>
                  <div className="flex gap-3" key={split.id}>
                    <UserAvatar user={split.recipient} size={60}/>

                    <div className="grow">
                      <div className="text-xl text-light">
                        {Number(split.amount)}{config.currency} to {split.recipient.name}
                      </div>
                      <div className="h-[3px] rounded-full bg-[#0000001A] shadow-progress-split mt-3">
                        <div
                          className="rounded-full h-full bg-[#0F61FF]"
                          style={{width: `${Math.round(Number(split.amount) / Number(donation.amount) * 100)}%`}}
                        >
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>}
          </div>
        </div>

        {donation.review && <div className={`grow bg-container-grey rounded-lg p-4 ${donation.splits.length <= 1 ? 'basis-3/4' : ''}`}>
          <Image
            width={60}
            height={60}
            src={PenIcon}
            alt="Review"
            className="hidden md:block mb-6"
          />

          <div className="text-light text-xl">
            {donation.createdAt.toLocaleDateString()} - Your review
          </div>

          <div className="text-project-focus text-3xl mt-6 break-words">
            “{donation.review}”
          </div>

          <div className="mt-6 flex gap-2 flex-col md:flex-row">
            <UiButton
              color="outlined"
              onPress={openShareReview}
            >
              Share review
            </UiButton>

            {bestDonation && !isBestDonation && <UiButton
              color="lead"
              onClick={() => openGiveModal(leadAmount!)}
            >
              Give {leadAmount!}{config.currency} to take the lead
            </UiButton>}
          </div>
        </div>}
      </div>
    </div>
  );
}
