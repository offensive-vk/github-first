import * as core from '@actions/core';
import { GitHubFetcher } from './src/first';
import exec from '@actions/exec';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run(): Promise<void> {
    try {
        // Get inputs from action
        const username = core.getInput('username', { required: true });
        const token = core.getInput('token', { required: true });

        if (!username.trim()) {
            throw new Error('Username cannot be empty');
        }

        if (!token.trim()) {
            throw new Error('Token cannot be empty');
        }

        // Validate username format (basic GitHub username validation)
        const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
        if (!usernameRegex.test(username)) {
            throw new Error('Invalid GitHub username format');
        }

        core.info(`🔍 Analyzing GitHub user: ${username}`);

        // Initialize GitHub API client
        const fetcher = new GitHubFetcher(token);

        // Fetch all "first everything" data
        const results = await fetcher.fetchFirstEverything(username);

        // Create a human-readable summary
        const summary = generateSummary(results);

        // Set outputs
        core.setOutput('results', JSON.stringify(results, null, 2));
        core.setOutput('summary', summary);

        // Log summary to console
        core.info('\n' + summary);

        core.info('✅ Successfully fetched all first items!');
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('An unknown error occurred');
        }
    }
}

function generateSummary(results: any): string {
    const lines: string[] = [];
    lines.push(`📊 First Everything Report for @${results.username}`);
    lines.push('='.repeat(50));

    if (results.accountCreated) {
        try {
            lines.push(`👤 Account created: ${new Date(results.accountCreated).toLocaleDateString()}`);
        } catch (error) {
            lines.push(`👤 Account created: ${results.accountCreated}`);
        }
    }

    if (results.firstRepository) {
        try {
            lines.push(`📂 First repository: ${results.firstRepository.name} (${new Date(results.firstRepository.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`📂 First repository: ${results.firstRepository.name}`);
        }
    }

    if (results.firstCommit) {
        try {
            const commitDate = results.firstCommit.commit.author?.date || results.firstCommit.commit.committer?.date;
            const dateStr = commitDate ? new Date(commitDate).toLocaleDateString() : 'Unknown date';
            lines.push(`💾 First commit: ${results.firstCommit.sha.substring(0, 7)} (${dateStr})`);
        } catch (error) {
            lines.push(`💾 First commit: ${results.firstCommit.sha.substring(0, 7)}`);
        }
    }

    if (results.firstIssue) {
        try {
            lines.push(`🐛 First issue: #${results.firstIssue.number} (${new Date(results.firstIssue.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`🐛 First issue: #${results.firstIssue.number}`);
        }
    }

    if (results.firstPullRequest) {
        try {
            lines.push(`🔀 First PR: #${results.firstPullRequest.number} (${new Date(results.firstPullRequest.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`🔀 First PR: #${results.firstPullRequest.number}`);
        }
    }

    if (results.firstGist) {
        try {
            lines.push(`📝 First gist: ${results.firstGist.id} (${new Date(results.firstGist.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`📝 First gist: ${results.firstGist.id}`);
        }
    }

    if (results.firstStarredRepo) {
        try {
            const dateToUse = results.firstStarredRepo.starred_at || results.firstStarredRepo.created_at;
            lines.push(`⭐ First starred repo: ${results.firstStarredRepo.full_name} (${new Date(dateToUse).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`⭐ First starred repo: ${results.firstStarredRepo.full_name}`);
        }
    }

    if (results.firstWorkflowRun) {
        try {
            lines.push(`⚡ First workflow run: ${results.firstWorkflowRun.name} (${new Date(results.firstWorkflowRun.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`⚡ First workflow run: ${results.firstWorkflowRun.name}`);
        }
    }

    if (results.firstFork) {
        try {
            lines.push(`🍴 First fork: ${results.firstFork.name} (${new Date(results.firstFork.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`🍴 First fork: ${results.firstFork.name}`);
        }
    }

    if (results.firstOrganization) {
        lines.push(`🏢 First organization: ${results.firstOrganization.login}`);
    }

    if (results.firstFollowing) {
        lines.push(`👥 First following: ${results.firstFollowing.login}`);
    }

    if (results.firstPublicEvent) {
        try {
            lines.push(`📅 First public event: ${results.firstPublicEvent.type} (${new Date(results.firstPublicEvent.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`📅 First public event: ${results.firstPublicEvent.type}`);
        }
    }

    if (results.firstRelease) {
        try {
            lines.push(`🚀 First release: ${results.firstRelease.tag_name} (${new Date(results.firstRelease.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`🚀 First release: ${results.firstRelease.tag_name}`);
        }
    }

    if (results.firstComment) {
        try {
            lines.push(`💬 First comment: On issue #${results.firstComment.issue_number} (${new Date(results.firstComment.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`💬 First comment: On issue #${results.firstComment.issue_number}`);
        }
    }

    if (results.firstWatch) {
        try {
            lines.push(`👀 First watched repo: ${results.firstWatch.full_name} (${new Date(results.firstWatch.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`👀 First watched repo: ${results.firstWatch.full_name}`);
        }
    }

    if (results.firstContribution) {
        try {
            lines.push(`🤝 First contribution: ${results.firstContribution.type} to ${results.firstContribution.repo} (${new Date(results.firstContribution.created_at).toLocaleDateString()})`);
        } catch (error) {
            lines.push(`🤝 First contribution: ${results.firstContribution.type} to ${results.firstContribution.repo}`);
        }
    }

    const foundItems = Object.keys(results).filter(key => key !== 'username' && results[key] !== null).length;
    lines.push(`\n🔍 Found ${foundItems} different "first" items!`);

    return lines.join('\n');
}

if (require.main === module) {
    run();
}