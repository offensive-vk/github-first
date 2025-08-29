import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHubFetcher } from 'Fetcher';

export interface FirstEverythingResult {
    username: string;
    accountCreated?: string | null;
    firstRepository?: { name: string; created_at: string } | null;
    firstCommit?: {
        sha: string;
        commit: { author?: { date?: string }; committer?: { date?: string } };
    } | null;
    firstGist?: { id: string; created_at: string } | null;
    firstStarredRepo?: { full_name: string; starred_at?: string; created_at?: string } | null;
    firstWorkflowRun?: { name: string; created_at: string } | null;
    firstFork?: { name: string; created_at: string } | null;
    firstOrganization?: { login: string } | null;
    firstFollowing?: { login: string } | null;
    firstFollower?: { login: string } | null;
    firstPublicEvent?: { type: string; created_at: string } | null;
    firstRelease?: { tag_name: string; created_at: string } | null;
    firstComment?: { issue_number: number; created_at: string } | null;
    firstWatch?: { full_name: string; created_at: string } | null;
    firstContribution?: { type: string; repo: string; created_at: string } | null;
    firstIssue: { issue_number: string, created_at: string } | null;
    firstPullRequest: { pr_number: string, created_at: string } | null;
}

function formatDate(val?: string | Date): string {
    if (!val) return 'Unknown date';
    try {
        return new Date(val as string).toLocaleDateString();
    } catch {
        return String(val);
    }
}

function generateSummary(results: FirstEverythingResult): string {
    const lines: string[] = [];
    lines.push(`📊 First Everything Report for @${results.username}`);
    lines.push('='.repeat(60));

    if (results.accountCreated)
        lines.push(`👤 Account created: ${formatDate(results.accountCreated)}`);

    if (results.firstRepository)
        lines.push(
            `📂 First repository: ${results.firstRepository.name} (${formatDate(
                results.firstRepository.created_at
            )})`
        );

    if (results.firstCommit) {
        const dateStr =
            results.firstCommit.commit.author?.date ??
            results.firstCommit.commit.committer?.date ??
            'Unknown date';
        lines.push(
            `💾 First commit: ${results.firstCommit.sha.substring(0, 7)} (${formatDate(
                dateStr
            )})`
        );
    }

    if (results.firstIssue)
        lines.push(
            `🐛 First issue: #${results.firstIssue.number} (${formatDate(
                results.firstIssue.created_at
            )})`
        );

    if (results.firstPullRequest)
        lines.push(
            `🔀 First PR: #${results.firstPullRequest.number} (${formatDate(
                results.firstPullRequest.created_at
            )})`
        );

    if (results.firstGist)
        lines.push(
            `📝 First gist: ${results.firstGist.id} (${formatDate(
                results.firstGist.created_at
            )})`
        );

    if (results.firstStarredRepo) {
        const dateToUse =
            results.firstStarredRepo.starred_at ??
            results.firstStarredRepo.created_at ??
            'Unknown date';
        lines.push(
            `⭐ First starred repo: ${results.firstStarredRepo.full_name} (${formatDate(
                dateToUse
            )})`
        );
    }

    if (results.firstWorkflowRun)
        lines.push(
            `⚡ First workflow run: ${results.firstWorkflowRun.name} (${formatDate(
                results.firstWorkflowRun.created_at
            )})`
        );

    if (results.firstFork)
        lines.push(
            `🍴 First fork: ${results.firstFork.name} (${formatDate(
                results.firstFork.created_at
            )})`
        );

    if (results.firstOrganization)
        lines.push(`🏢 First organization: ${results.firstOrganization.login}`);

    if (results.firstFollowing)
        lines.push(`👥 First following: ${results.firstFollowing.login}`);

    if (results.firstFollower)
        lines.push(`👥 First follower: ${results.firstFollower.login}`);

    if (results.firstPublicEvent)
        lines.push(
            `📅 First public event: ${results.firstPublicEvent.type} (${formatDate(
                results.firstPublicEvent.created_at
            )})`
        );

    if (results.firstRelease)
        lines.push(
            `🚀 First release: ${results.firstRelease.tag_name} (${formatDate(
                results.firstRelease.created_at
            )})`
        );

    if (results.firstComment)
        lines.push(
            `💬 First comment: On issue #${results.firstComment.issue_number} (${formatDate(
                results.firstComment.created_at
            )})`
        );

    if (results.firstWatch)
        lines.push(
            `👀 First watched repo: ${results.firstWatch.full_name} (${formatDate(
                results.firstWatch.created_at
            )})`
        );

    if (results.firstContribution)
        lines.push(
            `🤝 First contribution: ${results.firstContribution.type} to ${results.firstContribution.repo} (${formatDate(
                results.firstContribution.created_at
            )})`
        );

    const found = Object.keys(results).filter(
        (k) => k !== 'username' && results[k as keyof FirstEverythingResult] != null
    ).length;
    lines.push(`\n🔍 Found ${found} different "first" items!`);

    return lines.join('\n');
}

async function run(): Promise<void> {
    try {
        const username = core.getInput('username', { required: true }).trim();
        const token = core.getInput('token', { required: true }).trim();
        const octokit = github.getOctokit(token);
        const context = github.context;
        const ref = context.ref;
        const eventBranch = ref.replace(/^refs\/[^/]+\//, '');
        if (!username) throw new Error('Username cannot be empty');
        if (!token) throw new Error('Token cannot be empty');

        // Basic GitHub username validation (same as before)
        const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
        if (!usernameRegex.test(username))
            throw new Error('Invalid GitHub username format');

        core.info(`🔍 Analyzing GitHub user: ${username}`);

        const fetcher = new GitHubFetcher();
        const results = await fetcher.fetchFirstEverything(username);
        const summary = generateSummary(results);

        core.setOutput('results', JSON.stringify(results, null, 2));
        core.setOutput('summary', summary);

        const fs = await import('fs');
        const path = await import('path');
        const summaryPath = path.resolve(process.env.GITHUB_STEP_SUMMARY || '');
        if (summaryPath) {
            const current = await fs.promises.readFile(summaryPath, 'utf8');
            await fs.promises.writeFile(summaryPath, current + '\n' + summary);
        }

        core.info(summary);
        core.info('✅ Successfully fetched all first items!');
    } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        core.setFailed(err);
    }
}

if (require.main === module) {
    run();
}