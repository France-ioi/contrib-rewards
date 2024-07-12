import {Modal, ModalContent, ModalBody} from "@nextui-org/react";
import {DonationFull, MergeRequestWithAuthors} from "@/app/lib/definitions";
import {UiButton} from "@/app/ui/button";
import {createDonation, getRecipientEmailHashes} from "@/app/lib/data/donations";
import {useEffect, useRef, useState} from "react";
import {inter} from "@/app/ui/fonts";
import config from "@/app/lib/config";
import {useSession} from "next-auth/react";
import {getLeadAmountFromCurrentAmount} from "@/app/lib/helpers";
import UserAvatar from "@/app/ui/user-avatar";
import StatsPlusIcon from "@/public/icons/stats-plus.svg";
import StatsMinusIcon from "@/public/icons/stats-minus.svg";
import FilesIcon from "@/public/icons/files.svg";
import SectionsIcon from "@/public/icons/sections.svg";
import Image from "next/image";
import {MergeRequestAuthor} from "@prisma/client";
import ThankYou from "@/app/ui/contribution/thankyou";
import ShareReview from "@/app/ui/contribution/share-review";
import {smartContractDonate} from "@/app/lib/smart_contract_client";

interface ContributionModalProps {
  mergeRequest: MergeRequestWithAuthors,
  amount: number|null,
  open: boolean,
  onClose: () => void,
  onDonated: () => void,
  initDonation?: DonationFull|null,
  initReview?: string|null,
}

enum SplitMethod {
  LinesAdded = 'lines_added',
  LinesRemoved = 'lines_removed',
  Equal = 'equal',
}

export default function ContributionModal({mergeRequest, amount, open, onClose, onDonated, initDonation, initReview}: ContributionModalProps) {
  const [loading, setLoading] = useState(false);
  const {data: session} = useSession();
  const user = session?.user;
  let leadAmount = null;
  if (mergeRequest.bestDonorId !== user?.id) {
    leadAmount = getLeadAmountFromCurrentAmount(mergeRequest, user);
  }

  const [localAmount, setLocalAmount] = useState<number|null>(amount);
  const [changingAmount, setChangingAmount] = useState(false);
  const [donationSplits, setDonationSplits] = useState<{[authorIndex: string]: number}>({});
  const [amountSplits, setAmountSplits] = useState<{[authorIndex: string]: number}>({});
  const [donation, setDonation] = useState<DonationFull|null|undefined>(initDonation);
  const [review, setReview] = useState<string|null|undefined>(initReview);
  const [donatingStatus, setDonatingStatus] = useState<string|null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChangingAmount(null === amount);
    setLocalAmount(amount);
    splitBy(SplitMethod.Equal);
  }, [open, amount, mergeRequest.authors.length]);

  useEffect(() => {
    setDonation(initDonation);
    setReview(initReview);
  }, [initDonation, initReview, open]);

  const confirm = async () => {
    if (null === localAmount || 100 !== sumDonationSplits) {
      return;
    }

    setLoading(true);
    setDonatingStatus('Preparing transaction');
    if (ref.current) {
      setTimeout(() => {
        ref.current!.scrollTo({
          top: 999999,
        });
      });
    }

    try {
      const emailHashes = await getRecipientEmailHashes(mergeRequest.authors.map(author => author.authorId));

      const remappedAuthorSplits: {[authorId: string]: number} = {};
      for (let i = 0; i < mergeRequest.authors.length; i++) {
        remappedAuthorSplits[emailHashes[mergeRequest.authors[i].authorId]] = amountSplits[i];
      }

      const operationHash = await smartContractDonate(mergeRequest.id, localAmount, remappedAuthorSplits);

      setDonatingStatus('Waiting for transaction to be confirmed');

      const {donation, error} = await createDonation(operationHash);
      if (error) {
        //TODO: handle error;
        throw new Error(error);
      }

      setDonation(donation);
      onDonated();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
      setDonatingStatus(null);
    }
  };

  const takeLeadAmount = () => {
    setLocalAmount(leadAmount);
    setChangingAmount(false);
  };

  const splitChange = (authorIndex: number, increment: number) => {
    const newDonationSplits = {
      ...donationSplits,
    };

    newDonationSplits[authorIndex] = Math.max(0, Math.min(100, newDonationSplits[authorIndex] + increment));

    setDonationSplits(newDonationSplits);
  };

  const splitBy = (splitMethod: SplitMethod) => {
    const methods: Record<SplitMethod, ((author: MergeRequestAuthor) => number)> = {
      [SplitMethod.LinesAdded]: author => author.linesAdded,
      [SplitMethod.LinesRemoved]: author => author.linesRemoved,
      [SplitMethod.Equal]: author => 1,
    };

    let sumValues = 0;
    for (let authorIndex = 0; authorIndex < mergeRequest.authors.length; authorIndex++) {
      sumValues += methods[splitMethod](mergeRequest.authors[authorIndex]);
    }

    const newDonationSplits: {[key: string]: number} = {};
    let allocated = 0;
    for (let authorIndex = 0; authorIndex < mergeRequest.authors.length; authorIndex++) {
      if (authorIndex === mergeRequest.authors.length - 1) {
        newDonationSplits[authorIndex] = 100 - allocated;
      } else {
        const value = methods[splitMethod](mergeRequest.authors[authorIndex]);
        newDonationSplits[authorIndex] = Math.round(value / sumValues * 100);
      }
      allocated += newDonationSplits[authorIndex];
    }

    setDonationSplits(newDonationSplits);
  };

  const sumDonationSplits = Object.values(donationSplits).reduce((a, next) => a + next, 0);

  useEffect(() => {
    const splits: {[authorIndex: string]: number} = {};
    if (null === localAmount) {
      setAmountSplits(splits);
      return;
    }

    let allocated = 0;
    for (let authorIndex = 0; authorIndex < mergeRequest.authors.length; authorIndex++) {
      if (authorIndex === mergeRequest.authors.length - 1 && 100 === sumDonationSplits) {
        splits[authorIndex] = Math.round((localAmount - allocated) * 100) / 100;
      } else {
        splits[authorIndex] = Math.round(donationSplits[authorIndex] * localAmount) / 100;
      }
      allocated += splits[authorIndex];
    }

    setAmountSplits(splits);
  }, [localAmount, donationSplits, mergeRequest, sumDonationSplits]);

  const splitNeeded = mergeRequest.authors.length > 1;
  const leadAmountButton = !!(leadAmount && (null === localAmount || leadAmount > localAmount));

  const onSentReview = (review: string) => {
    setReview(review);
    onDonated();
  };

  return (
    <Modal
      size="2xl"
      backdrop="opaque"
      hideCloseButton
      isOpen={open}
      onClose={onClose}
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <div
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-2"
              ref={ref}
            >
              {donation ?
                (review ?
                    <ShareReview
                      donation={donation}
                      review={review}
                    />
                    :
                    <ThankYou
                      donation={donation}
                      onSentReview={onSentReview}
                    />
                )
                :
                <>
                  <h2 className="text-2xl md:text-4xl text-project-focus mb-6">
                    You are on track to support this merge with
                  </h2>

                  {!changingAmount ?
                    <div
                      className={`font-bold text-project-focus text-6xl md:text-9xl mb-6 text-center ${inter.className}`}>
                      {localAmount}<span className="text-5xl md:text-7xl">{config.currency}</span>
                    </div>
                    :
                    <div className="flex justify-center">
                      <div
                        className="w-[350px] border-2 border-container-grey rounded-full mb-6 px-6 py-4 flex gap-4 items-center font-bold text-project-focus">
                        <input
                          type="number"
                          className="w-full grow text-6xl outline-none"
                          value={String(localAmount)}
                          onChange={(e) => setLocalAmount(Math.max(0.01, Number(e.target.value)))}
                        />
                        <div className="text-5xl">{config.currency}</div>
                      </div>
                    </div>
                  }

                  <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
                    {!changingAmount && <UiButton
                      color="outlined"
                      className={`flex-grow ${!leadAmountButton ? 'max-w-[300px]' : ''}`}
                      onClick={() => setChangingAmount(true)}
                    >
                      Change amount
                    </UiButton>}
                    {leadAmountButton && <UiButton
                      color="outlined"
                      className={`flex-grow ${changingAmount ? 'max-w-[300px]' : ''}`}
                      onClick={takeLeadAmount}
                    >
                      {leadAmount}{config.currency} to take the lead
                    </UiButton>}
                  </div>

                  {splitNeeded && <>
                    <p className="text-xl md:text-3xl mt-10">How would you like to divide your donation between the
                      authors?</p>

                    <div className="flex flex-col gap-6 mt-6">
                      {mergeRequest.authors.map((author, authorIndex) =>
                        <div key={author.id}>
                          <div className="flex gap-3 items-center">
                            <UserAvatar user={author.author} size={40}/>
                            <div>
                              <div className="font-bold text-xl">
                                {author.author.name}
                              </div>
                              <div className="flex gap-3">
                                <div className="flex gap-1.5">
                                  <Image
                                    width={16}
                                    height={16}
                                    src={StatsPlusIcon}
                                    alt="Lines added"
                                  />
                                  <div className="text-[#00CB39]">
                                    {author.linesAdded}
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Image
                                    width={16}
                                    height={16}
                                    src={StatsMinusIcon}
                                    alt="Lines removed"
                                  />
                                  <div className="text-[#FF120F]">
                                    {author.linesRemoved}
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Image
                                    width={16}
                                    height={16}
                                    src={FilesIcon}
                                    alt="Files changed"
                                  />
                                  <div>
                                    {author.filesChanged}
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <Image
                                    width={16}
                                    height={16}
                                    src={SectionsIcon}
                                    alt="Sections changed"
                                  />
                                  <div>
                                    {author.sectionsChanged}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="w-full flex gap-2 h-[40px] mt-3">
                            <div
                              className="rounded-full border border-light-grey flex items-center justify-center text-light font-medium w-[40px] cursor-pointer select-none"
                              onClick={() => splitChange(authorIndex, -1)}
                            >
                              -
                            </div>
                            <div className="grow h-full rounded-full bg-[#0000001A] shadow-progress-split">
                              <div
                                className="rounded-full h-full bg-[#0F61FF] text-white font-bold flex items-center px-4"
                                style={{width: `${12 + Math.round(donationSplits[authorIndex] * 0.88)}%`}}>
                                {donationSplits[authorIndex]}%
                              </div>
                            </div>
                            <div
                              className="rounded-full border border-light-grey flex items-center justify-center text-light font-medium w-[40px] cursor-pointer select-none"
                              onClick={() => splitChange(authorIndex, 1)}
                            >
                              +
                            </div>
                            {null !== localAmount &&
                              <div className="flex items-center justify-center font-bold min-w-[50px]">
                                {amountSplits[authorIndex]}{config.currency}
                              </div>}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xl md:text-3xl mt-10">Not sure how to split?</p>

                    <div className="text-nowrap overflow-x-auto min-h-[42px]">
                      <div className="flex gap-2">
                        <UiButton
                          color="outlined"
                          onPress={() => splitBy(SplitMethod.LinesAdded)}
                        >
                          Split by lines added
                        </UiButton>
                        <UiButton
                          color="outlined"
                          onPress={() => splitBy(SplitMethod.LinesRemoved)}
                        >
                          Split by lines removed
                        </UiButton>
                        <UiButton
                          color="outlined"
                          onPress={() => splitBy(SplitMethod.Equal)}
                        >
                          Equal split
                        </UiButton>
                      </div>
                    </div>
                  </>}

                  {100 === sumDonationSplits ?
                    <p className="text-light mt-6">
                      You are about to transfer a total of {localAmount}{config.currency} to the merge
                      author{splitNeeded ? 's' : ''}, as shown
                      above.
                    </p>
                    :
                    <p className="text-[#FF120F] mt-6">
                      You must split 100% of the total amount. You have currently allocated {sumDonationSplits}%.
                    </p>
                  }

                  <div className="text-center mt-2">
                    <UiButton
                      color="lead"
                      className="w-full md:w-min px-8"
                      onPress={confirm}
                      isLoading={loading}
                      isDisabled={100 !== sumDonationSplits || null === localAmount}
                    >
                      Confirm and send
                    </UiButton>
                  </div>

                  {null !== donatingStatus && <div className="text-center text-light">
                    {donatingStatus}...
                  </div>}
                </>
              }
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
