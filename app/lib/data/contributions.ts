import {GitlabFetcher} from "@/app/lib/data/repository/gitlab_fetcher";
import prisma, {transformDecimalsToNumbers} from "@/app/lib/db";
import {Prisma} from "@prisma/client";
import {MergeRequestWithAuthors} from "@/app/lib/definitions";

export async function fetchMergeRequests(): Promise<MergeRequestWithAuthors[]> {
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
      // TODO: limit to current period
      const mergeRequests = await gitlabFetcher.getMergeRequests({});
      await syncMergeRequestsWithDatabase(mergeRequests);
    }
  } catch (e) {
    // In case of error, use cached version
    console.error(e);
  }

  // TODO: limit to current period
  // TODO: add backers count and total donation amount
  const mergeRequests = prisma.mergeRequest.findMany({
    include: {
      authors: true,
      bestDonor: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  transformDecimalsToNumbers(mergeRequests);

  return mergeRequests;
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

