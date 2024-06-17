// Typescript definitions

export interface MergeRequest {
  id: string,
  title: string,
  mergedAt: Date,
  authors: RepositoryUser[],
  linesAdded: number,
  linesRemoved: number,
  filesChanged: number,
  sectionsChanged: number,
  link: string,
  backingData?: MergeRequestBackingData,
}

export interface MergeRequestBackingData {
  backers: MergeRequestBacker[],
  backingTotalAmount: number, // tez
  topBacker: MergeRequestBacker,
}

export interface MergeRequestBacker {
  backer: User,
  amount: number, // tez
  review: string,
}

export interface RepositoryUser {
  repositoryId: string,
  name: string,
  photo: string,
}

export interface User {
  id: string,
  gitlabId: string,
}
