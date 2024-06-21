import {GitlabFetcher} from "@/app/lib/data/repository/gitlab_fetcher";
import {MergeRequest} from "@/app/lib/definitions";
import prisma from "@/app/lib/db";

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

    console.log({latestMergeRequestID, latestMergeRequestInBase})

    if (!latestMergeRequestInBase.length || latestMergeRequestID !== latestMergeRequestInBase[0].id) {
      // TODO: limit to current period
      const mergeRequests = await gitlabFetcher.getMergeRequests({});
      await syncMergeRequestsWithDatabase(mergeRequests);
    }
  } catch (e) {
    // In case of error, use cached version
    console.error(e);
  }

  return [];
  // return mergeRequests;
}

async function syncMergeRequestsWithDatabase(mergeRequests: MergeRequest[]) {
  console.log('sync', mergeRequests);
}