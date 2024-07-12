import {GitlabFetcher} from "@/app/lib/data/repository/gitlab_fetcher";
import prisma, {transformDecimalsToNumbers} from "@/app/lib/db";
import {Prisma} from "@prisma/client";
import {
  MergeRequestBackingData,
  MergeRequestWithAuthorsAndBackingData,
  MergeRequestWithAuthorsIncludes,
} from "@/app/lib/definitions";
import config from "@/app/lib/config";

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
      let mergeRequests = await gitlabFetcher.getMergeRequests({mergedAfter});
      if (mergeRequests.length < config.contributionsDisplayLastCount) {
        mergeRequests = await gitlabFetcher.getMergeRequests({limit: config.contributionsDisplayLastCount});
      }
      await syncMergeRequestsWithDatabase(mergeRequests);
    }
  } catch (e) {
    // In case of error, use cached version
    console.error(e);
  }

  const mergeRequests = await getMergeRequestsFromDatabase(authorId, mergedAfter);

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
  const mergeRequestDbIds = (await prisma.mergeRequest.findMany({
    select: {
      repositoryId: true,
    },
  })).map(mergeRequest => mergeRequest.repositoryId);

  const filteredMergeRequests = mergeRequests.filter(mergeRequest => {
    return -1 === mergeRequestDbIds.indexOf(mergeRequest.repositoryId);
  });

  for (let mergeRequest of filteredMergeRequests) {
    await prisma.mergeRequest.create({
      data: mergeRequest,
    });
  }
}

async function getMergeRequestsFromDatabase(authorId: string|null = null, mergedAfter: Date|null = null) {
  const mergeRequests = await prisma.mergeRequest.findMany({
    where: {
      ...(authorId ? {
        authors: {
          some: {
            authorId: authorId,
          }
        }
      } : {}),
      ...(mergedAfter ? {
        mergedAt: {
          gte: mergedAfter,
        },
      } : {}),
    },
    include: MergeRequestWithAuthorsIncludes,
    orderBy: {
      mergedAt: 'desc',
    },
    take: null === authorId ? config.contributionsDisplayLastCount : undefined,
  });

  if (null === authorId && mergeRequests.length < config.contributionsDisplayLastCount) {
    const mergeRequestsIds = mergeRequests.map(mergeRequest => mergeRequest.id);

    const otherMergeRequests = await prisma.mergeRequest.findMany({
      where: {
        id: {
          notIn: mergeRequestsIds,
        }
      },
      include: MergeRequestWithAuthorsIncludes,
      orderBy: {
        mergedAt: 'desc',
      },
      take: config.contributionsDisplayLastCount - mergeRequests.length,
    });

    return [
      ...mergeRequests,
      ...otherMergeRequests,
    ];
  }

  return mergeRequests;
}
