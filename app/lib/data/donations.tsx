'use server';

import prisma from "@/app/lib/db";
import {DonationInput} from "@/app/lib/definitions";
import {auth} from "@/app/lib/auth";

export async function createDonation(donationInput: DonationInput) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error('You should be logged in');
  }

  const donation = await prisma.donation.create({
    data: {
      mergeRequestId: donationInput.mergeRequestId,
      amount: donationInput.amount,
      review: donationInput.review,
      donorId: user.id,
    },
  })

  console.log('create donation');
}
