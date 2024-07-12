import {GitlabFetcher} from "@/app/lib/data/repository/gitlab_fetcher";
import prisma, {transformDecimalsToNumbers} from "@/app/lib/db";
import {Prisma} from "@prisma/client";
import {
  MergeRequestBackingData,
  MergeRequestWithAuthorsAndBackingData
} from "@/app/lib/definitions";

export async function fetchMergeRequests(authorId: string|null = null, mergedAfter: Date|null = null): Promise<MergeRequestWithAuthorsAndBackingData[]> {
  const gitlabFetcher = new GitlabFetcher();

  try {
    const latestMergeRequestID = await gitlabFetcher.getLatestMergeRequestId();
    const latestMergeRequestInBase = await prisma.mergeRequest.findMany({
      orderBy: {
        mergedAt: 'desc',
      },
      take: 1,
    });

    if (!latestMergeRequestInBase.length || latestMergeRequestID !== latestMergeRequestInBase[0].repositoryId) {
      const mergeRequests = await gitlabFetcher.getMergeRequests({mergedAfter});
      await syncMergeRequestsWithDatabase(mergeRequests);
    }
  } catch (e) {
    // In case of error, use cached version
    console.error(e);
  }

  const mergeRequests = await prisma.mergeRequest.findMany({
    where: {
      ...(authorId ? {
        authors: {
          some: {
            authorId: authorId,
          }
        }
      } : {}),
      // ...(mergedAfter ? {
      //   mergedAt: {
      //     gte: mergedAfter,
      //   },
      // } : {}),
    },
    include: {
      authors: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        }
      },
      donations: {
        include: {
          donor: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      bestDonor: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      mergedAt: 'desc',
    },
    take: 20,
  });

  const mergeRequestIds = mergeRequests.map(mergeRequest => mergeRequest.id);

  const backerDataByMergeRequestId: {[mergeRequestId: string]: MergeRequestBackingData} = {};
  if (mergeRequestIds.length) {
    const backersData = await prisma.$queryRaw
      `SELECT mergeRequestId, SUM(amount) AS sum, COUNT(DISTINCT donorId) AS count
       FROM \`Donation\`
       WHERE mergeRequestId IN (${Prisma.join(mergeRequestIds)})
       GROUP BY mergeRequestId` as {mergeRequestId: string, sum: number, count: number}[];

    for (let backerData of backersData) {
      backerDataByMergeRequestId[backerData.mergeRequestId] = {
        donationsSum: Number(backerData.sum),
        donorsCount: Number(backerData.count),
      }
    }
  }

  const mergeRequestsWithBackerData: MergeRequestWithAuthorsAndBackingData[] = [];
  for (let mergeRequest of mergeRequests) {
    let backersData: MergeRequestBackingData = {
      donorsCount: 0,
      donationsSum: 0,
    };
    if (mergeRequest.id in backerDataByMergeRequestId) {
      backersData = backerDataByMergeRequestId[mergeRequest.id];
    }

    mergeRequestsWithBackerData.push({
      ...mergeRequest,
      ...backersData,
    });
  }

  transformDecimalsToNumbers(mergeRequestsWithBackerData);

  return mergeRequestsWithBackerData;
}

async function syncMergeRequestsWithDatabase(mergeRequests: Prisma.MergeRequestCreateInput[]) {
  for (let mergeRequest of mergeRequests) {
    let mergeRequestDb = await prisma.mergeRequest.findUnique({
      where: {
        repositoryId: mergeRequest.repositoryId,
      },
    });

    if (null !== mergeRequestDb) {
      // Don't reimport merge request. If necessary, we could update it here
      continue;
    }

    mergeRequestDb = await prisma.mergeRequest.create({
      data: mergeRequest,
    });
  }
}

