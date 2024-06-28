"use client";

import MergeIcon from '@/public/icons/merge.svg';
import CoinsIcon from '@/public/icons/coins.svg';
import FilesIcon from '@/public/icons/files.svg';
import GitlabIcon from '@/public/icons/gitlab.svg';
import MedalTopIcon from '@/public/icons/medal-top.svg';
import Image from "next/image";
import ContributionModal from "@/app/ui/contribution/contribution-modal";
import {useState} from "react";
import {UiButton} from "@/app/ui/button";
import {MergeRequestWithAuthorsAndBackingData} from "@/app/lib/definitions";
import {useSession} from "next-auth/react";
import {signIn} from "next-auth/react";
import config from "@/app/lib/config";
import {inter} from "@/app/ui/fonts";
import UserAvatar from "@/app/ui/user-avatar";
import {getLeadAmountFromCurrentAmount} from "@/app/lib/helpers";
import {useRouter} from "next/navigation";

interface ContributionProps {
  mergeRequest: MergeRequestWithAuthorsAndBackingData,
}

export default function Contribution({mergeRequest}: ContributionProps) {
  const {data: session} = useSession();
  const user = session?.user;

  const router = useRouter();

  const defaultAmounts = [1, 10, 1000];
  let leadAmount = null;

  const giveOptions: {amount: number|null, lead?: boolean}[] = [
    {amount: null},
  ];
  if (mergeRequest.bestDonorId !== user?.id) {
    leadAmount = getLeadAmountFromCurrentAmount(Number(mergeRequest.bestDonorAmount ?? 0));

    giveOptions.push({
      amount: leadAmount,
      lead: true,
    });
  }

  for (let amount of defaultAmounts) {
    if (!(giveOptions.find(a => a.amount === amount))) {
      giveOptions.push({amount});
    }
  }

  giveOptions.sort((a, b) => {
    if (null === a.amount) {
      return 1;
    }
    if (null === b.amount) {
      return -1;
    }

    return a.amount - b.amount;
  });


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
      <div className="flex flex-col md:flex-row gap-6">
        <div className="grow">
          <header className="flex gap-3 items-start">
            <Image
              width={24}
              height={24}
              src={MergeIcon}
              alt="Merge Request"
              className="mt-1"
            />
            <h4 className="text-2xl">
              {mergeRequest.title}
            </h4>
          </header>
          <div className="flex flex-col md:flex-row mt-6 gap-6">
            <div className="bg-container-grey rounded-lg p-4 flex items-center justify-center">
              <div>
                <div className="text-light text-center">
                  {mergeRequest.authors.length} author{mergeRequest.authors.length > 1 ? 's' : ''}, {mergeRequest.donorsCount} backer{mergeRequest.donorsCount > 1 ? 's' : ''}
                </div>
                <div className="text-action text-center">
                  {mergeRequest.sectionsChanged} section{mergeRequest.sectionsChanged > 1 ? 's' : ''} edited
                </div>
                <div className="flex flex-col md:flex-row border border-light-grey rounded-lg items-center mt-3">
                  <div className="flex gap-3 items-center px-6 h-[40px]">
                    <div className="text-[#00CB39]">+{mergeRequest.linesAdded}</div>
                    <div className="text-[#FF120F]">+{mergeRequest.linesRemoved}</div>
                    <div className="flex gap-1 items-center">
                      <Image
                        width={14}
                        height={14}
                        src={FilesIcon}
                        alt="Files"
                      />
                      <span
                        className="text-nowrap">{mergeRequest.filesChanged} file{mergeRequest.filesChanged > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <a
                    href={mergeRequest.link}
                    target="_blank"
                    rel="nofollow noopener"
                    className="flex gap-1 items-center px-3 h-[40px] border-t border-t-light-grey md:border-t-0 w-full justify-center"
                  >
                    <span className="text-light text-nowrap">View at Gitlab</span>
                    <Image
                      width={16}
                      height={16}
                      src={GitlabIcon}
                      alt="Gitlab"
                    />
                  </a>
                </div>
              </div>
            </div>
            {mergeRequest.bestDonor && <div>
              <div className="flex items-center gap-3">
                <UserAvatar
                  user={mergeRequest.bestDonor}
                  size={70}
                />

                <div>
                  <div className="flex items-center gap-2">
                    <Image
                      width={16}
                      height={16}
                      src={MedalTopIcon}
                      alt="Top donor"
                    />
                    <div className="text-action">
                      Top donor review
                    </div>
                  </div>

                  <div className="text-2xl">
                    {mergeRequest.bestDonor.name}
                  </div>
                </div>
              </div>

              <div className="bg-container-grey p-4 flex flex-col md:flex-row gap-8 rounded-lg mt-5 relative">
                <div
                  className="border-solid border-b-container-grey border-b-[12px] border-x-transparent border-x-[12px] border-t-0 absolute top-[-12px] left-[24px]"
                ></div>

                <p
                  className={`text-3xl ${inter.className}`}>
                  {mergeRequest.bestDonorAmount?.toString()}<span className="text-xl">{config.currency}</span>
                </p>

                <div className="text-light">
                  “{mergeRequest.bestDonorReview}”
                </div>
              </div>
            </div>}
            <div className="text-center flex-grow">
              <ContributionModal
                mergeRequest={mergeRequest}
                amount={givenAmount}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onDonated={() => router.refresh()}
              />

              <h5 className="text-light text-xl">Show your appreciation and give...</h5>
              <div className="md:flex md:flex-wrap gap-2 mt-4 md:mt-6 md:justify-center text-nowrap overflow-x-auto">
                {giveOptions.map(option =>
                  <UiButton
                    key={option.amount}
                    color={option.lead ? 'lead' : 'outlined'}
                    className="mr-2"
                    onClick={() => openGiveModal(option.amount)}
                  >
                    {option.amount ? <>
                      {option.amount}{config.currency} {option.lead ? 'to take the lead' : ''}
                    </> : <>Give other amount</>}
                  </UiButton>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-center justify-center gap-4">
          <header className="flex gap-1 items-center justify-center grow md:grow-0">
            <Image
              width={24}
              height={24}
              src={CoinsIcon}
              alt="Backing"
            />
            <span className="text-light">The Backing</span>
          </header>
          <div className="grow bg-container-grey rounded-lg py-4 px-5 flex items-center justify-center">
            <span className="text-5xl font-medium text-project-focus">
              {mergeRequest.donationsSum}{config.currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
