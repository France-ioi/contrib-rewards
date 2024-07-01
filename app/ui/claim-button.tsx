'use client';

import {UiButton} from "@/app/ui/button";

export default function ClaimButton() {
  const claim = () => {
    console.log('claim');
  }

  return (
    <UiButton
      color="lead"
      onClick={claim}
    >
      Claim it!
    </UiButton>
  )
}
