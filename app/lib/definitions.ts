// Typescript definitions
import {Prisma} from '@prisma/client'

export interface DonationInput {
  mergeRequestId: string,
  review?: string,
  amount: number,
  splits: any[], //TODO
}

export type MergeRequestWithAuthors = Prisma.MergeRequestGetPayload<{
  include: {
    authors: true,
  },
}>

export type DonationFull = Prisma.DonationGetPayload<{
  include: {
    mergeRequest: {
      include: {
        authors: true,
        donations: {
          select: {
            amount: true,
            donorId: true,
          },
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
    },
    splits: true,
  },
}>
