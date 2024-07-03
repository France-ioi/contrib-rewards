'use client';

import {UiButton} from "@/app/ui/button";
import {smartContractClaim} from "@/app/lib/smart_contract_client";
import {useState} from "react";
import {useSession} from "next-auth/react";

export default function ClaimButton() {
  const [loading, setLoading] = useState(false);
  const {data: session} = useSession();
  const user = session?.user;

  const claim = async () => {
    setLoading(true);
    try {
      await smartContractClaim(user!.emailHash);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <UiButton
      color="lead"
      onClick={claim}
      isLoading={loading}
    >
      Claim it!
    </UiButton>
  )
}
