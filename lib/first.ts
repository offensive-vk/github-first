import { Octokit } from '@octokit/rest';
import * as core from '@actions/core';
import {
  FirstEverythingResults,
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubGist,
  GitHubWorkflowRun,
  GitHubOrganization,
  GitHubEvent,
  GitHubRelease,
  GitHubComment,
  FirstContribution
} from 'where to get these?;

// Rate limiting utility
class RateLimiter {
  private lastCall = 0;
  private minInterval: number;

  constructor(minIntervalMs: number = 100) {
    this.minInterval = minIntervalMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCall = Date.now();
  }
}

// Timeout wrapper utility
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

export class GitHubFetcher {
  private octokit: Octokit;
  private rateLimiter: RateLimiter;
  
  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'GitHub-First-Everything-Action/1.0.0',
    });
    this.rateLimiter = new RateLimiter(150); // 150ms between API calls
  }

  async fetchFirstEverything(username: string): Promise<FirstEverythingResults> {
    core.info(`🚀 Starting comprehensive analysis for user: ${username}`);
    
    const results: FirstEverythingResults = {
      username,
      accountCreated: null,
      firstRepository: null,
      firstCommit: null,
      firstIssue: null,
      firstPullRequest: null,
      firstGist: null,
      firstStarredRepo: null,
      firstWorkflowRun: null,
      firstFork: null,
      firstOrganization: null,
      firstFollowing: null,
      firstPublicEvent: null,
      firstRelease: null,
      firstComment: null,
      firstWatch: null,
      firstContribution: null,
    };

    // Fetch all data in parallel where possible with timeouts
    const fetchPromises = [
      withTimeout(this.fetchUserProfile(username), 15000).then(user => {
        results.accountCreated = user?.created_at || null;
        core.info(`✅ Account created: ${results.accountCreated}`);
      }).catch(error => {
        core.warning(`Failed to fetch user profile: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstRepository(username), 15000).then(repo => {
        results.firstRepository = repo;
        if (repo) core.info(`✅ First repository: ${repo.name} (${repo.created_at})`);
      }).catch(error => {
        core.warning(`Failed to fetch first repository: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstCommit(username), 15000).then(commit => {
        results.firstCommit = commit;
        if (commit) core.info(`✅ First commit: ${commit.sha.substring(0, 7)}`);
      }).catch(error => {
        core.warning(`Failed to fetch first commit: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstIssue(username), 15000).then(issue => {
        results.firstIssue = issue;
        if (issue) core.info(`✅ First issue: #${issue.number}`);
      }).catch(error => {
        core.warning(`Failed to fetch first issue: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstPullRequest(username), 15000).then(pr => {
        results.firstPullRequest = pr;
        if (pr) core.info(`✅ First PR: #${pr.number}`);
      }).catch(error => {
        core.warning(`Failed to fetch first pull request: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstGist(username), 15000).then(gist => {
        results.firstGist = gist;
        if (gist) core.info(`✅ First gist: ${gist.id}`);
      }).catch(error => {
        core.warning(`Failed to fetch first gist: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstStarredRepository(username), 15000).then(repo => {
        results.firstStarredRepo = repo;
        if (repo) core.info(`✅ First starred repo: ${repo.full_name}`);
      }).catch(error => {
        core.warning(`Failed to fetch first starred repository: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstWorkflowRun(username), 30000).then(run => {
        results.firstWorkflowRun = run;
        if (run) core.info(`✅ First workflow run: ${run.name}`);
      }).catch(error => {
        core.warning(`Failed to fetch first workflow run: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstFork(username), 15000).then(fork => {
        results.firstFork = fork;
        if (fork) core.info(`✅ First fork: ${fork.name}`);
      }).catch(error => {
        core.warning(`Failed to fetch first fork: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstOrganization(username), 15000).then(org => {
        results.firstOrganization = org;
        if (org) core.info(`✅ First organization: ${org.login}`);
      }).catch(error => {
        core.warning(`Failed to fetch first organization: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstFollowing(username), 15000).then(following => {
        results.firstFollowing = following;
        if (following) core.info(`✅ First following: ${following.login}`);
      }).catch(error => {
        core.warning(`Failed to fetch first following: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstPublicEvent(username), 15000).then(event => {
        results.firstPublicEvent = event;
        if (event) core.info(`✅ First public event: ${event.type}`);
      }).catch(error => {
        core.warning(`Failed to fetch first public event: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstRelease(username), 30000).then(release => {
        results.firstRelease = release;
        if (release) core.info(`✅ First release: ${release.tag_name}`);
      }).catch(error => {
        core.warning(`Failed to fetch first release: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstComment(username), 30000).then(comment => {
        results.firstComment = comment;
        if (comment) core.info(`✅ First comment found`);
      }).catch(error => {
        core.warning(`Failed to fetch first comment: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstWatchedRepository(username), 15000).then(watch => {
        results.firstWatch = watch;
        if (watch) core.info(`✅ First watched repo: ${watch.full_name}`);
      }).catch(error => {
        core.warning(`Failed to fetch first watched repository: ${error.message}`);
      }),
      
      withTimeout(this.fetchFirstContribution(username), 15000).then(contrib => {
        results.firstContribution = contrib;
        if (contrib) core.info(`✅ First contribution: ${contrib.type}`);
      }).catch(error => {
        core.warning(`Failed to fetch first contribution: ${error.message}`);
      }),
    ];

    // Wait for all fetches to complete
    await Promise.all(fetchPromises);
    
    core.info(`🎉 Analysis complete! Found data for ${Object.keys(results).filter(key => key !== 'username' && results[key as keyof FirstEverythingResults] !== null).length} different \"first\" items.`);
    
    return results;
  }

  private async fetchUserProfile(username: string): Promise<GitHubUser | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.users.getByUsername({
        username,
      });
      return data as GitHubUser;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          core.warning(`User '${username}' not found`);
        } else {
          core.warning(`Failed to fetch user profile: ${error.message}`);
        }
      } else {
        core.warning(`Failed to fetch user profile: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstRepository(username: string): Promise<GitHubRepository | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        sort: 'created',
        direction: 'asc',
        per_page: 1,
      });
      return data.length > 0 ? (data[0] as GitHubRepository) : null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first repository: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first repository: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstCommit(username: string): Promise<GitHubCommit | null> {
    try {
      await this.rateLimiter.wait();
      // Use search API to find oldest commits by this author
      const { data } = await this.octokit.rest.search.commits({
        q: `author:${username}`,
        sort: 'committer-date',
        order: 'asc',
        per_page: 1,
      });
      return data.items.length > 0 ? (data.items[0] as GitHubCommit) : null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first commit: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first commit: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstIssue(username: string): Promise<GitHubIssue | null> {
    try {
      await this.rateLimiter.wait();
      // Search for issues created by the user
      const { data } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:issue`,
        sort: 'created',
        order: 'asc',
        per_page: 1,
      });
      return data.items.length > 0 ? (data.items[0]) : null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first issue: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first issue: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstPullRequest(username: string): Promise<GitHubPullRequest | null> {
    try {
      await this.rateLimiter.wait();
      // Search for PRs created by the user
      const { data } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr`,
        sort: 'created',
        order: 'asc',
        per_page: 1,
      });
      return data.items.length > 0 ? (data.items[0] as GitHubPullRequest) : null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first pull request: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first pull request: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstGist(username: string): Promise<GitHubGist | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.gists.listForUser({
        username,
        per_page: 100, // Gists API doesn't support sorting, so we get many and sort manually
      });
      
      if (data.length === 0) return null;
      
      // Sort by creation date and return the oldest
      const sortedGists = data.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      return sortedGists[0] as GitHubGist;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first gist: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first gist: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstStarredRepository(username: string): Promise<GitHubRepository | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.activity.listReposStarredByUser({
        username,
        sort: 'created',
        direction: 'asc',
        per_page: 1,
      });
      return data.length > 0 ? (data[0] as GitHubRepository) : null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first starred repository: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first starred repository: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstWorkflowRun(username: string): Promise<GitHubWorkflowRun | null> {
    try {
      await this.rateLimiter.wait();
      // Get user's repositories first
      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username,
        per_page: 10, // Check first 10 repos for workflow runs
      });

      let oldestRun: GitHubWorkflowRun | null = null;
      
      for (const repo of repos) {
        try {
          await this.rateLimiter.wait();
          const { data: runs } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
            owner: repo.owner.login,
            repo: repo.name,
            per_page: 5,
          });
          
          if (runs.workflow_runs.length > 0) {
            const repoOldest = runs.workflow_runs.reduce((oldest, run) => 
              new Date(run.created_at) < new Date(oldest.created_at) ? run : oldest
            );
            
            if (!oldestRun || new Date(repoOldest.created_at) < new Date(oldestRun.created_at)) {
              oldestRun = repoOldest as GitHubWorkflowRun;
            }
          }
        } catch (err) {
          // Skip repos where we can't access workflow runs (likely private or no actions)
          continue;
        }
      }
      
      return oldestRun;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first workflow run: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first workflow run: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstFork(username: string): Promise<GitHubRepository | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        type: 'all',
        sort: 'created',
        direction: 'asc',
        per_page: 100,
      });
      
      // Find the first forked repository
      const firstFork = data.find(repo => repo.fork);
      return firstFork ? (firstFork as GitHubRepository) : null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first fork: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first fork: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstOrganization(username: string): Promise<GitHubOrganization | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.orgs.listForUser({
        username,
        per_page: 100,
      });
      
      if (data.length === 0) return null;
      
      // Organizations API doesn't provide join date, so we return the first one
      // In practice, this would need additional API calls to get membership dates
      return data[0] as GitHubOrganization;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first organization: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first organization: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstFollowing(username: string): Promise<GitHubUser | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.users.listFollowingForUser({
        username,
        per_page: 100,
      });
      
      if (data.length === 0) return null;
      
      // Following API doesn't provide follow dates, so we return the first one
      return data[0] as GitHubUser;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first following: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first following: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstPublicEvent(username: string): Promise<GitHubEvent | null> {
    try {
      await this.rateLimiter.wait();
      // Get events (limited to last 90 days by GitHub)
      const { data } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });
      
      if (data.length === 0) return null;
      
      // Sort by creation date and return the oldest
      const sortedEvents = data.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      return sortedEvents[0] as GitHubEvent;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first public event: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first public event: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstRelease(username: string): Promise<GitHubRelease | null> {
    try {
      await this.rateLimiter.wait();
      // Get user's repositories
      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username,
        per_page: 20, // Check first 20 repos for releases
      });

      let oldestRelease: GitHubRelease | null = null;
      
              for (const repo of repos) {
          try {
            await this.rateLimiter.wait();
            const { data: releases } = await this.octokit.rest.repos.listReleases({
              owner: repo.owner.login,
              repo: repo.name,
              per_page: 10,
            });
          
          if (releases.length > 0) {
            const repoOldest = releases.reduce((oldest, release) => 
              new Date(release.created_at) < new Date(oldest.created_at) ? release : oldest
            );
            
            if (!oldestRelease || new Date(repoOldest.created_at) < new Date(oldestRelease.created_at)) {
              oldestRelease = repoOldest as GitHubRelease;
            }
          }
        } catch (err) {
          // Skip repos where we can't access releases
          continue;
        }
      }
      
      return oldestRelease;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first release: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first release: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstComment(username: string): Promise<GitHubComment | null> {
    try {
      await this.rateLimiter.wait();
      // Search for issues where the user has commented
      const { data } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `commenter:${username}`,
        sort: 'created',
        order: 'asc',
        per_page: 5,
      });
      
      if (data.items.length === 0) return null;
      
      // Get comments from the oldest issue that has comments from this user
      for (const issue of data.items) {
        try {
          let owner = '';
          let repo = '';
          try {
            const repoUrl = new URL(issue.repository_url);
            const segments = repoUrl.pathname.split('/').filter(Boolean); // ["repos", "owner", "repo"]
            if (segments.length >= 3) {
              owner = segments[1];
              repo = segments[2];
            }
          } catch (e) {
            core.warning(`Invalid repository URL: ${issue.repository_url}`);
          }
          
          if (!owner || !repo) {
            core.warning(`Could not extract owner/repo from URL: ${issue.repository_url}`);
            continue;
          }
          
          await this.rateLimiter.wait();
          const { data: comments } = await this.octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: issue.number,
            per_page: 100,
          });
          
          // Find comments by this user
          const userComments = comments.filter(comment => 
            comment.user?.login === username
          );
          
          if (userComments.length > 0) {
            // Return the oldest comment by this user
            const oldestComment = userComments.reduce((oldest, comment) => 
              new Date(comment.created_at) < new Date(oldest.created_at) ? comment : oldest
            );
            
            return {
              ...oldestComment,
              issue_number: issue.number
            } as GitHubComment;
          }
        } catch (err) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first comment: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first comment: ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstWatchedRepository(username: string): Promise<GitHubRepository | null> {
    try {
      await this.rateLimiter.wait();
      const { data } = await this.octokit.rest.activity.listWatchedReposForAuthenticatedUser({
        per_page: 100,
      });
      
      if (data.length === 0) return null;
      
      // Watched repos API doesn't provide watch dates for other users, 
      // and requires authentication for the current user
      // This is a limitation of the GitHub API
      return data[0] as GitHubRepository;
    } catch (error) {
      // This will likely fail for other users since it requires auth for the watching user
      if (error instanceof Error) {
        core.warning(`Failed to fetch first watched repository (API limitation): ${error.message}`);
      } else {
        core.warning(`Failed to fetch first watched repository (API limitation): ${String(error)}`);
      }
      return null;
    }
  }

  private async fetchFirstContribution(username: string): Promise<FirstContribution | null> {
    try {
      await this.rateLimiter.wait();
      // Get public events to find contributions to other repositories
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });
      
      // Filter events that represent contributions to repositories not owned by the user
      const contributions = events.filter(event => 
        event.repo && 
        !event.repo.name.startsWith(`${username}/`) &&
        ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'ForkEvent'].includes(event.type)
      );
      
      if (contributions.length === 0) return null;
      
      // Sort by creation date and return the oldest
      const sortedContributions = contributions.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const firstContrib = sortedContributions[0];
      
      return {
        type: firstContrib.type,
        repo: firstContrib.repo.name,
        created_at: firstContrib.created_at,
        url: `https://github.com/${firstContrib.repo.name}`,
        details: firstContrib.payload
      };
    } catch (error) {
      if (error instanceof Error) {
        core.warning(`Failed to fetch first contribution: ${error.message}`);
      } else {
        core.warning(`Failed to fetch first contribution: ${String(error)}`);
      }
      return null;
    }
  }
}
