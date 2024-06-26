'use server';

import prisma from "@/app/lib/db";
import {DonationFull, DonationInput} from "@/app/lib/definitions";
import {auth} from "@/app/lib/auth";
import {User} from "@prisma/client";
import {Decimal} from "@prisma/client/runtime/binary";
import {getCurrentPeriodData, getCurrentPeriodStart} from "@/app/lib/helpers";

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

export async function fetchDonations(user: User): Promise<DonationFull[]> {
  const donations = await prisma.donation.findMany({
    where: {
      donorId: user.id,
    },
    include: {
      mergeRequest: {
        include: {
          authors: true,
          donations: {
            select: {
              amount: true,
              donorId: true,
            },
            orderBy: {
              amount: 'desc',
            },
            take: 1,
          },
        },
      },
      splits: true,
    },
  });

  transformDecimalsToNumbers(donations);

  return donations;
}

export async function getDonationStats(): Promise<{amount: number}> {
  const donationPeriodStart = getCurrentPeriodData().periodStart;

  const totalAmount = await prisma.donation.aggregate({
    where: {
      createdAt: {
        gte: donationPeriodStart,
      }
    },
    _sum: {
      amount: true,
    },
  });

  return {
    amount: totalAmount._sum.amount?.toNumber() ?? 0,
  };
}


// recursive function looping deeply through an object to find Decimals
const transformDecimalsToNumbers = (obj: any) => {
  if (!obj) {
    return
  }

  for (const key of Object.keys(obj)) {
    if (Decimal.isDecimal(obj[key])) {
      obj[key] = obj[key].toNumber()
    } else if (typeof obj[key] === 'object') {
      transformDecimalsToNumbers(obj[key])
    }
  }
}
