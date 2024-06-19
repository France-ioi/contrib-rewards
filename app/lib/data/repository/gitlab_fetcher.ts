import {AbstractRepositoryFetcher} from "@/app/lib/data/repository/abstract_repository_fetcher";
import {MergeRequest, RepositoryUser} from "@/app/lib/definitions";
import config from "@/app/lib/config";

export class GitlabFetcher extends AbstractRepositoryFetcher {
  async getMergeRequests(params: any): Promise<MergeRequest[]> {
    try {
      const headers = {
        'content-type': 'application/json',
      };
      const requestBody = {
        query: `query getMergeRequests($fullPath: ID!) {
  project(fullPath: $fullPath) {
    id
    mergeRequests(state: merged, sort: MERGED_AT_DESC, first: 2) {
      nodes {
        id
        mergedAt
        title
        webUrl
        commits {
          nodes {
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
        }
      };

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      };

      const response = await (await fetch(config.repositoryEndpoint, options)).json();
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const {data: {project}} = response;

      const contributions: MergeRequest[] = [];
      for (let mergeRequest of project.mergeRequests.nodes) {
        let linesAdded = 0;
        let linesRemoved = 0;
        let filesChanged = 0;
        let sectionsChanged = 0;
        for (let diffStat of mergeRequest.diffStats) {
          linesAdded += diffStat.additions;
          linesRemoved += diffStat.deletions;
          filesChanged++;
        }

        const authors: RepositoryUser[] = [];
        for (let commit of mergeRequest.commits.nodes) {
          authors.push({
            repositoryId: commit.author?.id,
            name: commit.authorName,
            photo: commit.author?.avatarUrl,
          });
        }

        contributions.push({
          id: mergeRequest.id,
          mergedAt: new Date(mergeRequest.mergedAt),
          title: mergeRequest.title,
          link: mergeRequest.webUrl,
          linesAdded,
          linesRemoved,
          filesChanged,
          sectionsChanged,
          authors,
        });
      }

      return contributions;
    } catch (err) {
      console.error('Gitlab fetch error:', err);
      throw new Error('Failed to fetch Gitlab contributions.');
    }
  }
}
