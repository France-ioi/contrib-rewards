import {AbstractRepositoryFetcher} from "@/app/lib/data/repository/abstract_repository_fetcher";
import config from "@/app/lib/config";
import {Prisma} from "@prisma/client";

interface AuthorInfo {
  authorData: Prisma.MergeRequestAuthorCreateWithoutMergeRequestInput,
  filesChanged: Set<string>,
}

export class GitlabFetcher extends AbstractRepositoryFetcher {
  async getLatestMergeRequestId(): Promise<string> {
    try {
      const headers = {
        'content-type': 'application/json',
      };
      const requestBody = {
        query: `query getMergeRequests($fullPath: ID!) {
  project(fullPath: $fullPath) {
    id
    mergeRequests(state: merged, sort: MERGED_AT_DESC, first: 1) {
      nodes {
        iid
      }
    }
  }
}`,
        variables: {
          fullPath: config.repositoryPath,
        }
      };

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      };

      const response = await (await fetch(config.repositoryEndpoint + '/graphql', options)).json();
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const {data: {project}} = response;
      const mergeRequest = project.mergeRequests.nodes[0];

      return mergeRequest.iid;
    } catch (err) {
      console.error('Gitlab fetch error:', err);
      throw new Error('Failed to fetch Gitlab latest merge request.');
    }
  }

  async getMergeRequests(params: {mergedAfter: Date|null}): Promise<Prisma.MergeRequestCreateInput[]> {
    try {
      const headers = {
        'content-type': 'application/json',
      };
      const requestBody = {
        query: `query getMergeRequests($fullPath: ID!, $mergedAfter: Time) {
  project(fullPath: $fullPath) {
    id
    mergeRequests(state: merged, sort: MERGED_AT_DESC, first: 20, mergedAfter: $mergedAfter) {
      nodes {
        id
        iid
        projectId
        mergedAt
        title
        webUrl
        commits {
          nodes {
            sha
            title
            authorEmail
            authorName
            committerEmail
            committerName
            author {
              id
              username
              name
              avatarUrl
            }
          }
        }
        diffStats {
          additions
          deletions
          path
        }
      }
    }
  }
}`,
        variables: {
          fullPath: config.repositoryPath,
          mergedAfter: params.mergedAfter?.toISOString().split('T')[0],
        }
      };

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      };

      const response = await (await fetch(config.repositoryEndpoint  + '/graphql', options)).json();
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const {data: {project}} = response;

      const mergeRequests: Prisma.MergeRequestCreateInput[] = [];
      for (let mergeRequest of project.mergeRequests.nodes) {
        let linesAdded = 0;
        let linesRemoved = 0;
        let filesChanged = 0;
        const filesChangedList = new Set<string>();
        for (let diffStat of mergeRequest.diffStats) {
          linesAdded += diffStat.additions;
          linesRemoved += diffStat.deletions;
          filesChangedList.add(diffStat.path);
          filesChanged++;
        }
        const sectionsChanged = countSectionChanges(filesChangedList);

        const authors: Record<string, AuthorInfo> = {};
        for (let commit of mergeRequest.commits.nodes) {
          const commitStats = await this.getCommitStats(mergeRequest.projectId, commit.sha);
          const identifier = commit.authorEmail ?? commit.committerEmail;
          const committerName = commit.authorName ?? commit.committerName;
          if (!(identifier in authors)) {
            authors[identifier] = {
              authorData: {
                linesAdded: 0,
                linesRemoved: 0,
                filesChanged: 0,
                sectionsChanged: 0,
                author: {
                  connectOrCreate: {
                    where: {
                      email: identifier,
                    },
                    create: {
                      email: identifier,
                      name: committerName,
                    },
                  },
                }
              },
              filesChanged: new Set(),
            };
          }

          const author = authors[identifier];
          author.authorData.linesAdded += commitStats.linesAdded;
          author.authorData.linesRemoved += commitStats.linesRemoved;

          for (let fileChanged of commitStats.filesChangedList) {
            author.filesChanged.add(fileChanged);
          }
        }

        mergeRequests.push({
          repositoryId: mergeRequest.iid,
          mergedAt: new Date(mergeRequest.mergedAt),
          title: mergeRequest.title,
          link: mergeRequest.webUrl,
          linesAdded,
          linesRemoved,
          filesChanged,
          sectionsChanged,
          authors: {
            create: Object.values(authors).map(author => {
              return {
                ...author.authorData,
                filesChanged: author.filesChanged.size,
                sectionsChanged: countSectionChanges(author.filesChanged),
              }
            }),
          },
        });
      }

      return mergeRequests;
    } catch (err) {
      console.error('Gitlab fetch error:', err);
      throw new Error('Failed to fetch Gitlab merge requests.');
    }
  }

  async getCommitStats(projectId: string, commitSha: string) {
    const urlCommit = `${config.repositoryEndpoint}/v4/projects/${projectId}/repository/commits/${commitSha}`;
    const responseCommit = await (await fetch(urlCommit)).json();
    if (responseCommit.errors) {
      throw new Error(responseCommit.errors[0].message);
    }

    const urlDiff = `${config.repositoryEndpoint}/v4/projects/${projectId}/repository/commits/${commitSha}/diff`;
    const responseDiff = await (await fetch(urlDiff)).json();
    if (responseDiff.errors) {
      throw new Error(responseDiff.errors[0].message);
    }

    return {
      linesAdded: responseCommit.stats.additions,
      linesRemoved: responseCommit.stats.deletions,
      filesChangedList: responseDiff.map((diff: {new_path: string}) => diff.new_path),
    }
  }
}

function countSectionChanges(filesChangedList: Set<string>) {
  let sections = new Set<string>();
  for (let fileChanged of filesChangedList.values()) {
    const pathParts = fileChanged.split('/');
    if ('docs' !== pathParts[0]) {
      continue;
    }
    const pathWithoutLast = pathParts.slice(0, pathParts.length - 2).join('/');
    sections.add(pathWithoutLast);
  }

  return sections.size;
}
