import * as core from '@actions/core';
import * as github from '@actions/github';
import { FirstEverythingResult } from './index';

export class GitHubFetcher {
    private octokit: any;
    private username: string = '';

    // constructor(token: string) {
    //     this.octokit = new Octokit({
    //         auth: token,
    //         userAgent: 'github-first-everything',
    //     });
    // }
    async fetchFirstEverything(username: string, token: string): Promise<FirstEverythingResult> {
        this.username = username;
        this.octokit = github.getOctokit(token);
        const result: FirstEverythingResult = { username };

        try {
            // 1. Account creation date
            result.accountCreated = await this.getAccountCreated();

            // 2. First repository
            result.firstRepository = await this.getFirstRepository();

            // 3. First commit (across all repos – simplified: first commit in first repo)
            result.firstCommit = await this.getFirstCommit();

            // 4. First issue
            result.firstIssue = await this.getFirstIssue();

            // 5. First pull request
            result.firstPullRequest = await this.getFirstPullRequest();

            // 6. First gist
            result.firstGist = await this.getFirstGist();

            // 7. First starred repo
            result.firstStarredRepo = await this.getFirstStarredRepo();

            // 8. First workflow run
            result.firstWorkflowRun = await this.getFirstWorkflowRun();

            // 9. First fork
            result.firstFork = await this.getFirstFork();

            // 10. First organization
            result.firstOrganization = await this.getFirstOrganization();

            // 11. First following
            result.firstFollowing = await this.getFirstFollowing();

            // 12. First follower
            result.firstFollower = await this.getFirstFollower();

            // 13. First public event
            result.firstPublicEvent = await this.getFirstPublicEvent();

            // 14. First release
            result.firstRelease = await this.getFirstRelease();

            // 15. First comment
            result.firstComment = await this.getFirstComment();

            // 16. First watched repo
            result.firstWatch = await this.getFirstWatch();

            // 17. First contribution to someone else's repo
            result.firstContribution = await this.getFirstContribution();
        } catch (e) {
            core.warning(`Partial fetch – some data may be missing: ${e}`);
        }

        return result;
    }

    private async getAccountCreated(): Promise<string | null> {
        const { data } = await this.octokit.users.getByUsername({
            username: this.username,
        });
        return data.created_at ?? null;
    }
    private async getFirstRepository(): Promise<
        { name: string; created_at: string } | null
    > {
        const { data } = await this.octokit.repos.listForUser({
            username: this.username,
            sort: 'created',
            direction: 'asc',
            per_page: 1,
        });
        return data?.[0]
            ? { name: data[0].name!, created_at: data[0].created_at! }
            : null;
    }

    private async getFirstCommit(): Promise<
        | {
            sha: string;
            commit: { author?: { date?: string }; committer?: { date?: string } };
        }
        | null
    > {
        const firstRepo = await this.getFirstRepository();
        if (!firstRepo) return null;

        const { data } = await this.octokit.repos.listCommits({
            owner: this.username,
            repo: firstRepo.name,
            per_page: 1,
            sort: 'author-date',
            direction: 'asc',
        });
        const commit = data?.[0];
        return commit
            ? {
                sha: commit.sha!,
                commit: commit.commit!,
            }
            : null;
    }

    private async getFirstIssue(): Promise<
        { issue_number: number; created_at: string } | null
    > {
        const { data } = await this.octokit.search.issuesAndPullRequests({
            q: `author:${this.username}+type:issue`,
            sort: 'created',
            order: 'asc',
            per_page: 1,
        });
        const issue = data?.items?.[0];
        return issue
            ? { issue_number: issue.number!, created_at: issue.created_at! }
            : null;
    }

    private async getFirstPullRequest(): Promise<
        { pr_number: number; created_at: string } | null
    > {
        const { data } = await this.octokit.search.issuesAndPullRequests({
            q: `author:${this.username}+type:pr`,
            sort: 'created',
            order: 'asc',
            per_page: 1,
        });
        const pr = data?.items?.[0];
        return pr
            ? { pr_number: pr.number!, created_at: pr.created_at! }
            : null;
    }

    private async getFirstGist(): Promise<
        { id: string; created_at: string } | null
    > {
        const { data } = await this.octokit.gists.listForUser({
            username: this.username,
            per_page: 1,
            sort: 'created',
            direction: 'asc',
        });
        const gist = data?.[0];
        return gist
            ? { id: gist.id!, created_at: gist.created_at! }
            : null;
    }

    private async getFirstStarredRepo(): Promise<
        { full_name: string; starred_at?: string; created_at?: string } | null
    > {
        const { data } = await this.octokit.activity.listReposStarredByUser({
            username: this.username,
            per_page: 1,
            sort: 'created',
            direction: 'asc',
        });
        const repo = data?.[0];
        if (!repo) return null;

        // GitHub API v3 does not expose `starred_at` in this endpoint.
        // We approximate it with the repository’s created_at.
        return {
            full_name: repo.full_name!,
            created_at: repo.created_at!,
        };
    }

    private async getFirstWorkflowRun(): Promise<
        { name: string; created_at: string } | null
    > {
        // The Actions Runs API is available to authenticated users.
        const { data } = await this.octokit.actions.listWorkflowRunsForUser({
            username: this.username,
            per_page: 1,
            sort: 'created',
            direction: 'asc',
        });
        const run = data?.workflow_runs?.[0];
        return run
            ? { name: run.name ?? 'Unnamed', created_at: run.created_at! }
            : null;
    }

    private async getFirstFork(): Promise<
        { name: string; created_at: string } | null
    > {
        const { data } = await this.octokit.repos.listForUser({
            username: this.username,
            type: 'forks',
            sort: 'created',
            direction: 'asc',
            per_page: 1,
        });
        const repo = data?.[0];
        return repo
            ? { name: repo.name!, created_at: repo.created_at! }
            : null;
    }

    private async getFirstOrganization(): Promise<{ login: string } | null> {
        const { data } = await this.octokit.orgs.listForUser({
            username: this.username,
            per_page: 1,
        });
        const org = data?.[0];
        return org ? { login: org.login! } : null;
    }

    private async getFirstFollowing(): Promise<{ login: string } | null> {
        const { data } = await this.octokit.users.listFollowingForAuthenticatedUser({
            per_page: 1,
        });
        const user = data?.[0];
        return user ? { login: user.login! } : null;
    }

    private async getFirstFollower(): Promise<{ login: string } | null> {
        const { data } = await this.octokit.users.listFollowersForUser({
            username: this.username,
            per_page: 1,
        });
        const user = data?.[0];
        return user ? { login: user.login! } : null;
    }

    private async getFirstPublicEvent(): Promise<
        { type: string; created_at: string } | null
    > {
        const perPage = 100;
        let page = 1;
        let earliest: { type: string; created_at: string } | null = null;

        while (true) {
            const { data } = await this.octokit.activity.listPublicEventsForUser({
                username: this.username,
                per_page: perPage,
                page,
            });
            if (!data.length) break;

            // Find the oldest event on this page
            const oldestOnPage = data[data.length - 1];
            earliest = {
                type: oldestOnPage.type!,
                created_at: oldestOnPage.created_at!,
            };

            // If we got less than a full page, we’re done
            if (data.length < perPage) break;
            page++;
        }

        return earliest;
    }

    private async getFirstRelease(): Promise<
        { tag_name: string; created_at: string } | null
    > {
        const firstRepo = await this.getFirstRepository();
        if (!firstRepo) return null;

        const { data } = await this.octokit.repos.listReleases({
            owner: this.username,
            repo: firstRepo.name,
            per_page: 1,
            sort: 'created',
            direction: 'asc',
        });
        const release = data?.[0];
        return release
            ? { tag_name: release.tag_name!, created_at: release.created_at! }
            : null;
    }

    private async getFirstComment(): Promise<
        { issue_number: number; created_at: string } | null
    > {
        // Search comments authored by the user
        const { data } = await this.octokit.search.issuesAndPullRequests({
            q: `commenter:${this.username}`,
            sort: 'created',
            order: 'asc',
            per_page: 1,
        });
        const comment = data?.items?.[0];
        return comment
            ? { issue_number: comment.number!, created_at: comment.created_at! }
            : null;
    }

    private async getFirstWatch(): Promise<
        { full_name: string; created_at: string } | null
    > {
        const { data } = await this.octokit.activity.listReposWatchedByUser({
            username: this.username,
            per_page: 1,
            sort: 'created',
            direction: 'asc',
        });
        const repo = data?.[0];
        return repo
            ? { full_name: repo.full_name!, created_at: repo.created_at! }
            : null;
    }

    private async getFirstContribution(): Promise<
        { type: string; repo: string; created_at: string } | null
    > {
        // Search for the earliest PR the user opened *on someone else’s repo*
        const { data } = await this.octokit.search.issuesAndPullRequests({
            q: `author:${this.username}+type:pr`,
            sort: 'created',
            order: 'asc',
            per_page: 1,
        });
        const pr = data?.items?.[0];
        if (!pr) return null;

        const repo = pr.repository_url?.replace(
            'https://api.github.com/repos/',
            ''
        );
        return {
            type: 'PR',
            repo: repo ?? 'unknown',
            created_at: pr.created_at!,
        };
    }
}