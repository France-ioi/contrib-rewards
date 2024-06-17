import {MergeRequest} from "@/app/lib/definitions";

export abstract class AbstractRepositoryFetcher {
  abstract getMergeRequests(params: any): Promise<MergeRequest[]>;
}