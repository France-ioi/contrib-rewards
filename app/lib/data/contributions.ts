import {GitlabFetcher} from "@/app/lib/data/repository/gitlab_fetcher";
import {MergeRequest} from "@/app/lib/definitions";

export async function fetchContributions(): Promise<MergeRequest[]> {
  const gitlabFetcher = new GitlabFetcher();

  return await gitlabFetcher.getMergeRequests({});
}
