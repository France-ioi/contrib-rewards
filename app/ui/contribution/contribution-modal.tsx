import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";
import {DonationInput, MergeRequest} from "@/app/lib/definitions";
import {UiButton} from "@/app/ui/button";
import {createDonation} from "@/app/lib/data/donations";

interface ContributionModalProps {
  mergeRequest: MergeRequest,
  amount: number|null,
  open: boolean,
  onClose: () => void,
}

export default function ContributionModal({mergeRequest, amount, open, onClose}: ContributionModalProps) {
  const confirm = async () => {
    const donationInput: DonationInput = {
      mergeRequestId: mergeRequest.id,
      amount: Number(amount),
      splits: [],
    };
    const result = await createDonation(donationInput);
    console.log('result', result);
  };

  const splitNeeded = true;

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
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className="text-2xl md:text-4xl text-project-focus">
                You are on track to support this merge with
              </h2>
              <p className="font-bold text-project-focus text-6xl md:text-9xl text-center mt-6">
                {amount} ꜩ
              </p>
              <div className="flex flex-col md:flex-row mt-6 gap-2">
                <UiButton
                  color="outlined"
                  className="flex-grow"
                >
                  Change amount
                </UiButton>
                <UiButton
                  color="lead"
                  className="flex-grow"
                >
                  18ꜩ to take the lead
                </UiButton>
              </div>

              {splitNeeded && <>
                <p className="text-xl md:text-3xl mt-10">How would you like to divide your donation between the authors?</p>

                <p>split</p>

                <p className="text-xl md:text-3xl mt-10">Not sure how to split?</p>

                <p>split buttons</p>
              </>}

              <p className="text-light">
                You are about to transfer a total of 15tz to the merge author(s), as shown above.
              </p>

              <div className="text-center mt-6">
                <UiButton
                  color="lead"
                  className="w-full md:w-min"
                  onPress={confirm}
                >
                  Confirm and send
                </UiButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}