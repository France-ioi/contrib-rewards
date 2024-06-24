import {Prisma} from "@prisma/client";

export abstract class AbstractRepositoryFetcher {
  abstract getMergeRequests(params: any): Promise<Prisma.MergeRequestCreateInput[]>;
}