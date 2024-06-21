'use server';

import prisma from "@/app/lib/db";
import {DonationInput} from "@/app/lib/definitions";

export async function createDonation(donationInput: DonationInput) {
  const donation = await prisma.donation.create({
    data: {
      // email: 'elsa@prisma.io',
      // name: 'Elsa Prisma',
    },
  })

  console.log('create donation');
}
