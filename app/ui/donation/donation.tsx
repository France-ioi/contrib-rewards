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

interface DonationProps {
  donation: DonationFull,
}

export default function Donation({donation}: DonationProps) {
  const {data: session} = useSession();

  const giveOptions = [
    {amount: 1},
    {amount: 10},
    {amount: 18, lead: true},
    {amount: 1000},
    {amount: null},
  ];

  const bestDonation = donation.mergeRequest.donations.length ? donation.mergeRequest.donations[0] : null;
  const leadAmount = bestDonation ? getLeadAmountFromCurrentAmount(bestDonation.amount as unknown as number) : null;
  const isBestDonation = null !== bestDonation && bestDonation.donorId === session?.user?.id;
  console.log({bestDonation, session})

  const [modalOpen, setModalOpen] = useState(false);
  const [givenAmount, setGivenAmount] = useState<number|null>(null);

  const openGiveModal = async (amount: number|null) => {
    if (!session?.user) {
      signIn('france-ioi');
      return;
    }

    setGivenAmount(amount);
    setModalOpen(true);
  };

  return (
    <div className="rounded-lg shadow-card w-full p-4 bg-white">
      <ContributionModal
        mergeRequest={donation.mergeRequest}
        amount={givenAmount}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="">
          <header className="flex gap-3 items-start">
            <h3 className="text-3xl">
              {donation.mergeRequest.title}
            </h3>
          </header>
          <div className="flex flex-col md:flex-row mt-6 gap-6">
            <div className="bg-container-grey rounded-lg p-4">
              <p className="text-xl">
                You gave to this merge
              </p>
              <p className={`font-bold text-project-focus text-6xl md:text-9xl text-center mt-12 mb-12 ${inter.className}`}>
                {donation.amount.toString()}<span className="text-7xl">{config.currency}</span>
              </p>
              <div className="text-light text-center">
                <UiButton
                  color="outlined"
                  className="flex-grow w-full"
                >
                  Donate more
                </UiButton>
              </div>
            </div>
            <div className="p-4">
              <p className="text-light text-xl">How you split your donation</p>

              <p>TODO</p>
            </div>
          </div>
        </div>

        <div className="grow bg-container-grey rounded-lg p-4">
          <Image
            width={60}
            height={60}
            src={PenIcon}
            alt="Review"
            className="hidden md:visible mb-6"
          />

          <div className="text-light text-xl">
            {donation.createdAt.toLocaleDateString()} - Your review
          </div>

          <div className="text-project-focus text-3xl mt-6">
            “{donation.review}”
          </div>

          <div className="mt-6 flex gap-2 flex-col md:flex-row">
            <UiButton
              color="outlined"
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
        </div>
      </div>
    </div>
  );
}
