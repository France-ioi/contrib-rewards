import {GitlabFetcher} from "@/app/lib/data/repository/gitlab_fetcher";
import prisma from "@/app/lib/db";
import {MergeRequest, Prisma} from "@prisma/client";

export async function fetchMergeRequests(): Promise<MergeRequest[]> {
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
  return await prisma.mergeRequest.findMany();
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

