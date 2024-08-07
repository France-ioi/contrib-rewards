'use server';

import prisma, {transformDecimalsToNumbers} from "@/app/lib/db";
import {DonationFull, DonationFullIncludes} from "@/app/lib/definitions";
import {auth} from "@/app/lib/auth";
import {Donation, User} from "@prisma/client";
import {Prisma} from "@prisma/client";
import {getCurrentPeriodData} from "@/app/lib/helpers";
import SortOrder = Prisma.SortOrder;
import {hashEmail} from "@/app/lib/user";
import {getTransactionLongPolling} from "@/app/lib/smart_contract_server";
import config from "@/app/lib/config";

export async function createDonation(operationHash: string): Promise<{error?: string, donation?: DonationFull}> {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return {error: 'You should be logged in'};
  }

  const operation = await getTransactionLongPolling(operationHash, 30*1000);
  if (null === operation) {
    return {error: `Cannot find operation hash on the blockchain: ${operationHash}`};
  }

  // console.log('create donation', operationHash, operation);

  if (operation.target?.address !== config.smartContractAddress) {
    return {error: `Transaction was not made on the smart contract: ${operation.target?.address}`};
  }

  const parameters = operation.parameter?.value;

  const mergeRequestId = parameters.mergeID;
  const recipients = parameters.recipients;
  // console.log({recipients});
  const donationTotalAmount = operation.amount! / 1000000;

  const mergeRequest = await prisma.mergeRequest.findUnique({
    where: {
      id: mergeRequestId,
    },
    include: {
      authors: {
        include: {
          author: true,
        },
      },
    },
  });

  if (null === mergeRequest) {
    return {error: "Unknown merge request"};
  }

  const authorsById: {[authorId: string]: typeof mergeRequest.authors[0]} = {};
  for (let i = 0; i < mergeRequest.authors.length; i++) {
    const author = mergeRequest.authors[i];
    const authorHash = await hashEmail(author.author);
    authorsById[authorHash] = author;
  }

  let totalAmount = 0;
  const splitsToCreate: Prisma.DonationSplitUncheckedCreateWithoutDonationInput[] = [];
  for (let {recipientEmailHash, amount} of recipients) {
    if (!(recipientEmailHash in authorsById)) {
      return {error: "This author hash does not belong to the merge request authors: " + recipientEmailHash};
    }

    const splitAmount = Number(amount) / 1000000;
    totalAmount += splitAmount;
    splitsToCreate.push({
      amount: splitAmount,
      recipientId: authorsById[recipientEmailHash].authorId,
    });
  }

  // console.log({totalAmount, donationTotalAmount})
  if (totalAmount !== donationTotalAmount) {
    return {error: "Total amount does not equal sum of split amounts"};
  }

  const existingDonation = await prisma.donation.findUnique({
    where: {
      operationHash,
    },
  });

  if (null !== existingDonation) {
    return {error: "This donation has already been registered"};
  }

  const donation: DonationFull = await prisma.donation.create({
    data: {
      mergeRequestId: mergeRequestId,
      amount: donationTotalAmount,
      donorId: user.id,
      splits: {
        create: splitsToCreate,
      },
      operationHash,
    },
    include: DonationFullIncludes,
  });

  const donationReview = await prisma.donationReview.findFirst({
    where: {
      donorId: user.id,
      mergeRequestId: mergeRequestId,
    },
  });

  if (donationReview) {
    donation.review = donationReview.review;
  }

  await recomputeMergeRequestBestDonation(mergeRequestId);

  return {
    donation,
  };
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
  for (let donations of Object.values(donationsByDonor)) {
    let totalAmount = 0;
    let donorId: string|null = null;
    for (let donation of donations) {
      donorId = donation.donorId;
      totalAmount += donation.amount.toNumber();
    }

    if (null === bestDonorAmount || totalAmount > bestDonorAmount) {
      bestDonorAmount = totalAmount;
      bestDonorId = donorId;
    }
  }

  if (null !== bestDonorId) {
    const donationReview = await prisma.donationReview.findFirst({
      where: {
        donorId: bestDonorId,
        mergeRequestId: mergeRequestId,
      },
    });

    await prisma.mergeRequest.update({
      where: {
        id: mergeRequestId,
      },
      data: {
        bestDonorId,
        bestDonorAmount,
        bestDonorReview: donationReview?.review,
      },
    });
  }
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

  const mergeRequestIds = [...new Set(donations.map(donation => donation.mergeRequestId))];

  const donationReviews = await prisma.donationReview.findMany({
    where: {
      donorId: user.id,
      mergeRequestId: {
        in: mergeRequestIds,
      },
    },
  });

  const reviewByMergeRequestId: {[mergeRequestId: string]: string|null} = {};
  for (let donationReview of donationReviews) {
    reviewByMergeRequestId[donationReview.mergeRequestId] = donationReview.review;
  }

  let resultDonations: DonationFull[] = [];
  for (let donation of donations) {
    resultDonations.push({
      ...donation,
      review: reviewByMergeRequestId[donation.mergeRequestId] ?? null,
    });
  }

  transformDecimalsToNumbers(resultDonations);

  return resultDonations;
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

  const donationReview = await prisma.donationReview.findFirst({
    where: {
      donorId: donation.donorId,
      mergeRequestId: donation.mergeRequestId,
    },
  });

  if (null !== donationReview) {
    await prisma.donationReview.update({
      data: {
        review,
      },
      where: {
        id: donationReview.id,
      },
    });
  } else {
    await prisma.donationReview.create({
      data: {
        donorId: donation.donorId,
        mergeRequestId: donation.mergeRequestId,
        review,
      },
    })
  }

  await recomputeMergeRequestBestDonation(donation.mergeRequestId);
}

export async function getRecipientEmailHashes(recipientIds: string[]) {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: recipientIds,
      },
    },
  });

  let mapping: Record<string, string> = {};
  for (let user of users) {
    mapping[user.id] = await hashEmail(user);
  }

  return mapping;
}
