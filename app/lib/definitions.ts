// Typescript definitions
import {Prisma} from '@prisma/client'
import SortOrder = Prisma.SortOrder;

export interface DonationInput {
  mergeRequestId: string,
  review?: string,
  amount: number,
  splits: {[authorId: string]: number},
}

export type MergeRequestWithAuthors = Prisma.MergeRequestGetPayload<{
  include: {
    authors: {
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
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
}>;

export type MergeRequestWithAuthorsAndBackingData = MergeRequestWithAuthors & MergeRequestBackingData;

export interface MergeRequestBackingData {
  donorsCount: number,
  donationsSum: number
}

export type DonationFull = Prisma.DonationGetPayload<{
  include: {
    mergeRequest: {
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
        bestDonor: {
          select: {
            name: true,
            image: true,
          },
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
    splits: {
      include: {
        recipient: {
          select: {
            name: true,
            image: true,
          }
        },
      },
    },
  },
}>

export const DonationFullIncludes = {
  mergeRequest: {
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
      bestDonor: {
        select: {
          name: true,
          image: true,
        },
      },
      donations: {
        select: {
          amount: true,
          donorId: true,
        },
      },
    },
  },
  splits: {
    include: {
      recipient: {
        select: {
          name: true,
          image: true,
        }
      },
    },
  },
};

