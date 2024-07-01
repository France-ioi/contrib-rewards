'use server';

import prisma, {transformDecimalsToNumbers} from "@/app/lib/db";
import {DonationFull, DonationFullIncludes, DonationInput} from "@/app/lib/definitions";
import {auth} from "@/app/lib/auth";
import {Donation, User} from "@prisma/client";
import {Prisma} from "@prisma/client";
import {getCurrentPeriodData} from "@/app/lib/helpers";
import SortOrder = Prisma.SortOrder;

export async function createDonation(donationInput: DonationInput) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error('You should be logged in');
  }

  const mergeRequest = await prisma.mergeRequest.findUnique({
    where: {
      id: donationInput.mergeRequestId,
    },
    include: {
      authors: true,
    },
  });

  if (null === mergeRequest) {
    throw new Error("Unknown merge request");
  }

  const authorsById: {[authorId: string]: typeof mergeRequest.authors[0]} = {};
  for (let i = 0; i < mergeRequest.authors.length; i++) {
    const author = mergeRequest.authors[i];
    authorsById[author.id] = author;
  }

  let totalAmount = 0;
  const splitsToCreate: Prisma.DonationSplitUncheckedCreateWithoutDonationInput[] = [];
  for (let [authorId, splitAmount] of Object.entries(donationInput.splits)) {
    if (!(authorId in authorsById)) {
      throw new Error("This author id does not belong to the merge request authors: " + authorId);
    }
    totalAmount += splitAmount;
    splitsToCreate.push({
      amount: splitAmount,
      recipientId: authorsById[authorId].authorId,
    });
  }

  if (totalAmount !== donationInput.amount) {
    throw new Error("Total amount does not equal sum of split amounts");
  }

  const donation = await prisma.donation.create({
    data: {
      mergeRequestId: donationInput.mergeRequestId,
      amount: donationInput.amount,
      review: donationInput.review,
      donorId: user.id,
      splits: {
        create: splitsToCreate,
      },
    },
    include: DonationFullIncludes,
  });

  await recomputeMergeRequestBestDonation(donationInput.mergeRequestId);

  return donation;
}

export async function recomputeMergeRequestBestDonation(mergeRequestId: string) {
  const allDonations = await prisma.donation.findMany({
    where: {
      mergeRequestId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const donationsByDonor: {[key: string]: Donation[]} = {};
  for (let donation of allDonations) {
    if (!(donation.donorId in donationsByDonor)) {
      donationsByDonor[donation.donorId] = [];
    }
    donationsByDonor[donation.donorId].push(donation);
  }

  let bestDonorAmount: number|null = null;
  let bestDonorId: string|null = null;
  let bestDonorReview: string|null = null;
  for (let donations of Object.values(donationsByDonor)) {
    let totalAmount = 0;
    let donorId: string|null = null;
    let donorReview: string|null = null;
    for (let donation of donations) {
      donorId = donation.donorId;
      totalAmount += donation.amount.toNumber();
      if (donation.review) {
        donorReview = donation.review;
      }
    }

    if (null === bestDonorAmount || totalAmount > bestDonorAmount) {
      bestDonorAmount = totalAmount;
      bestDonorId = donorId;
      bestDonorReview = donorReview;
    }
  }

  await prisma.mergeRequest.update({
    where: {
      id: mergeRequestId,
    },
    data: {
      bestDonorId,
      bestDonorAmount,
      bestDonorReview,
    },
  });
}

export async function fetchDonations(user: User): Promise<DonationFull[]> {
  const donations = await prisma.donation.findMany({
    where: {
      donorId: user.id,
    },
    include: DonationFullIncludes,
    orderBy: {
      createdAt: SortOrder.desc,
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

export async function getUserDonationStats(user: User) {
  const donationPeriodStart = getCurrentPeriodData().periodStart;

  const totalAmountPeriod = await prisma.donation.aggregate({
    where: {
      createdAt: {
        gte: donationPeriodStart,
      },
      donorId: user.id,
    },
    _sum: {
      amount: true,
    },
  });

  const totalAmount = await prisma.donation.aggregate({
    where: {
      donorId: user.id,
    },
    _sum: {
      amount: true,
    },
  });

  const firstDonationDate = await prisma.donation.aggregate({
    where: {
      donorId: user.id,
    },
    _min: {
      createdAt: true,
    },
  });

  const topDonationsCount = await prisma.mergeRequest.aggregate({
    where: {
      bestDonorId: user.id,
    },
    _count: {
      bestDonorId: true,
    },
  });

  return {
    periodAmount: totalAmountPeriod._sum.amount?.toNumber() ?? 0,
    totalAmount: totalAmount._sum.amount?.toNumber() ?? 0,
    firstDonationDate: firstDonationDate._min.createdAt,
    currentTopDonationSpots: topDonationsCount._count.bestDonorId,
  };
}

export async function submitReview(donationId: string, review: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error('You should be logged in');
  }

  const donation = await prisma.donation.findUnique({
    where: {
      id: donationId,
    },
  });

  if (null === donation) {
    throw new Error("Donation could not be found: " + donationId);
  }

  if (user.id !== donation.donorId) {
    throw new Error("You are not the author of this donation");
  }

  await prisma.donation.update({
    where: {
      id: donationId,
    },
    data: {
      review,
    }
  });

  await recomputeMergeRequestBestDonation(donation.mergeRequestId);
}
