'use client';

import {UiButton} from "@/app/ui/button";
import {getTotalUnclaimedAmount, smartContractAuth} from "@/app/lib/smart_contract_client";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import config from "@/app/lib/config";
import {Spinner} from "@nextui-org/spinner";
import {getSmartContractAuthParameters} from "@/app/lib/smart_contract_server";

export default function ClaimButton() {
  const [loading, setLoading] = useState(false);
  const {data: session} = useSession();
  const user = session?.user;
  const [totalUnclaimedAmount, setTotalUnclaimedAmount] = useState<number|null>(null);

  const claim = async () => {
    setLoading(true);
    try {
      const {message, signature} = await getSmartContractAuthParameters(user!);

      //TODO: do this only if necessary (if emailHash doesn't exist)
      await smartContractAuth(message, signature);
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTotalUnclaimedAmount(user!.emailHash)
      .then(setTotalUnclaimedAmount)
  }, [user]);

  return (
    <div className="flex gap-6 items-center">
      {null === totalUnclaimedAmount ?
        <div>
          <Spinner/>
        </div>
        :
        <div
          className={`${0 < totalUnclaimedAmount ? 'bg-clip-text bg-gradient-to-r text-transparent from-[#0F61FF] to-[#E01AFF] leading-[4rem]' : ''}`}>
          {totalUnclaimedAmount}{config.currency}
        </div>
      }


      {null !== totalUnclaimedAmount && 0 < totalUnclaimedAmount && <UiButton
        color="lead"
        onClick={claim}
        isLoading={loading}
      >
        Claim it!
      </UiButton>}
    </div>
  )
}
