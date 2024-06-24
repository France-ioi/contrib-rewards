// Typescript definitions
import {Prisma} from '@prisma/client'

export interface DonationInput {
  mergeRequestId: string,
  review?: string,
  amount: number,
  splits: any[], //TODO
}

export type MergeRequestWithAuthors = Prisma.MergeRequestGetPayload<{
  include: {authors: true},
}>
