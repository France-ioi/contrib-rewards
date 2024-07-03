import {User} from "@prisma/client";
import prisma from "@/app/lib/db";
import {getTotalUnclaimedAmount} from "@/app/lib/smart_contract_server";

export async function getAuthorStats(user: User) {
  const totalUnclaimedAmount = await getTotalUnclaimedAmount(user);

  const totalAmount = await prisma.donationSplit.aggregate({
    where: {
      recipientId: user.id,
    },
    _sum: {
      amount: true,
    },
  });

  const firstDonationReceivedDate = await prisma.donation.aggregate({
    where: {
      splits: {
        some: {
          recipientId: user.id,
        },
      },
    },
    _min: {
      createdAt: true,
    },
  });

  return {
    totalAmount: totalAmount._sum.amount?.toNumber() ?? 0,
    totalUnclaimedAmount: totalUnclaimedAmount,
    firstDonationReceivedDate: firstDonationReceivedDate._min.createdAt,
  };
}
