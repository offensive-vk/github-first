# GitHub First Everything - Output Guide

## Overview

The GitHub First Everything action provides comprehensive data about a user's "first" activities on GitHub. This document explains the output format and how to use the results.

## Output Structure

The action provides two main outputs:

### 1. `results` (JSON Output)
A structured JSON object containing all the "first" items found for the user.

### 2. `summary` (Human-Readable Output)
A formatted text summary perfect for display in GitHub Actions logs and step summaries.

## JSON Output Format

```json
{
  "username": "octocat",
  "accountCreated": "2011-01-25T18:44:36Z",
  "firstRepository": {
    "name": "Hello-World",
    "created_at": "2011-01-26T19:01:12Z"
  },
  "firstCommit": {
    "sha": "6dcb09b5b57875f334f61aebed695e2e4193db5e",
    "commit": {
      "author": {
        "date": "2011-01-26T19:01:12Z"
      },
      "committer": {
        "date": "2011-01-26T19:01:12Z"
      }
    }
  },
  "firstIssue": {
    "issue_number": 1,
    "created_at": "2011-01-26T19:44:36Z"
  },
  "firstPullRequest": {
    "pr_number": 1,
    "created_at": "2011-01-26T19:45:36Z"
  },
  "firstGist": {
    "id": "1",
    "created_at": "2011-01-26T19:46:36Z"
  },
  "firstStarredRepo": {
    "full_name": "defunkt/defunkt",
    "created_at": "2011-01-26T19:47:36Z"
  },
  "firstWorkflowRun": {
    "name": "CI",
    "created_at": "2011-01-26T19:48:36Z"
  },
  "firstFork": {
    "name": "Spoon-Knife",
    "created_at": "2011-01-26T19:49:36Z"
  },
  "firstOrganization": {
    "login": "github"
  },
  "firstFollowing": {
    "login": "defunkt"
  },
  "firstFollower": {
    "login": "defunkt"
  },
  "firstPublicEvent": {
    "type": "CreateEvent",
    "created_at": "2011-01-26T19:50:36Z"
  },
  "firstRelease": {
    "tag_name": "v1.0.0",
    "created_at": "2011-01-26T19:51:36Z"
  },
  "firstComment": {
    "issue_number": 1,
    "created_at": "2011-01-26T19:52:36Z"
  },
  "firstWatch": {
    "full_name": "defunkt/defunkt",
    "created_at": "2011-01-26T19:53:36Z"
  },
  "firstContribution": {
    "type": "PR",
    "repo": "defunkt/defunkt",
    "created_at": "2011-01-26T19:54:36Z"
  }
}
```

## Human-Readable Summary Format

```
📊 First Everything Report for @octocat
============================================================
👤 Account created: 1/25/2011
📂 First repository: Hello-World (1/26/2011)
💾 First commit: 6dcb09b (1/26/2011)
🐛 First issue: #1 (1/26/2011)
🔀 First PR: #1 (1/26/2011)
📝 First gist: 1 (1/26/2011)
⭐ First starred repo: defunkt/defunkt (1/26/2011)
⚡ First workflow run: CI (1/26/2011)
🍴 First fork: Spoon-Knife (1/26/2011)
🏢 First organization: github
👥 First following: defunkt
👥 First follower: defunkt
📅 First public event: CreateEvent (1/26/2011)
🚀 First release: v1.0.0 (1/26/2011)
💬 First comment: On issue #1 (1/26/2011)
👀 First watched repo: defunkt/defunkt (1/26/2011)
🤝 First contribution: PR to defunkt/defunkt (1/26/2011)

🔍 Found 17 different "first" items!
```

## How to Use the Output

### 1. In GitHub Actions Workflows

```yaml
- name: Get First Everything
  id: first-everything
  uses: your-username/github-first-everything@v1
  with:
    username: ${{ github.actor }}
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Use JSON Results
  run: |
    echo "First repository: ${{ fromJson(steps.first-everything.outputs.results).firstRepository.name }}"
    echo "Account created: ${{ fromJson(steps.first-everything.outputs.results).accountCreated }}"

- name: Display Summary
  run: echo "${{ steps.first-everything.outputs.summary }}"
```

### 2. Accessing Specific Data Points

```yaml
- name: Extract Specific Information
  run: |
    RESULTS='${{ steps.first-everything.outputs.results }}'
    
    # Get first repository name
    FIRST_REPO=$(echo $RESULTS | jq -r '.firstRepository.name // "N/A"')
    echo "First repository: $FIRST_REPO"
    
    # Get account creation date
    ACCOUNT_CREATED=$(echo $RESULTS | jq -r '.accountCreated // "N/A"')
    echo "Account created: $ACCOUNT_CREATED"
    
    # Get first commit SHA
    FIRST_COMMIT=$(echo $RESULTS | jq -r '.firstCommit.sha // "N/A"')
    echo "First commit: $FIRST_COMMIT"
```

### 3. Creating Custom Reports

```yaml
- name: Generate Custom Report
  run: |
    RESULTS='${{ steps.first-everything.outputs.results }}'
    
    # Create a markdown report
    cat >> report.md << EOF
    # GitHub Activity Report for ${{ github.actor }}
    
    ## Key Milestones
    - **First Repository**: $(echo $RESULTS | jq -r '.firstRepository.name // "N/A"')
    - **First Commit**: $(echo $RESULTS | jq -r '.firstCommit.sha // "N/A"' | cut -c1-7)
    - **First Issue**: #$(echo $RESULTS | jq -r '.firstIssue.issue_number // "N/A"')
    - **First PR**: #$(echo $RESULTS | jq -r '.firstPullRequest.pr_number // "N/A"')
    
    ## Activity Summary
    $(echo $RESULTS | jq -r '. | keys | length') different types of first activities found.
    EOF
```

### 4. Conditional Logic Based on Results

```yaml
- name: Check User Experience Level
  run: |
    RESULTS='${{ steps.first-everything.outputs.results }}'
    
    # Check if user has made contributions to other repos
    if [ "$(echo $RESULTS | jq -r '.firstContribution')" != "null" ]; then
      echo "User has contributed to open source projects"
      echo "has_contributions=true" >> $GITHUB_OUTPUT
    else
      echo "User has not contributed to other repositories"
      echo "has_contributions=false" >> $GITHUB_OUTPUT
    fi
```

### 5. Integration with Other Tools

```yaml
- name: Send to Slack
  if: always()
  run: |
    SUMMARY='${{ steps.first-everything.outputs.summary }}'
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"$SUMMARY\"}" \
      ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Create GitHub Issue
  if: failure()
  run: |
    RESULTS='${{ steps.first-everything.outputs.results }}'
    gh issue create \
      --title "GitHub First Everything Analysis Failed" \
      --body "Failed to analyze user: ${{ github.actor }}\n\nResults: \`\`\`json\n$RESULTS\n\`\`\`"
```

## Data Field Explanations

| Field | Description | Example |
|-------|-------------|---------|
| `username` | The analyzed GitHub username | `"octocat"` |
| `accountCreated` | When the GitHub account was created | `"2011-01-25T18:44:36Z"` |
| `firstRepository` | User's first created repository | `{"name": "Hello-World", "created_at": "..."}` |
| `firstCommit` | First commit across all repositories | `{"sha": "6dcb09b...", "commit": {...}}` |
| `firstIssue` | First issue created by the user | `{"issue_number": 1, "created_at": "..."}` |
| `firstPullRequest` | First pull request created | `{"pr_number": 1, "created_at": "..."}` |
| `firstGist` | First gist created | `{"id": "1", "created_at": "..."}` |
| `firstStarredRepo` | First repository starred | `{"full_name": "defunkt/defunkt", "created_at": "..."}` |
| `firstWorkflowRun` | First GitHub Actions workflow run | `{"name": "CI", "created_at": "..."}` |
| `firstFork` | First repository forked | `{"name": "Spoon-Knife", "created_at": "..."}` |
| `firstOrganization` | First organization joined | `{"login": "github"}` |
| `firstFollowing` | First user followed | `{"login": "defunkt"}` |
| `firstFollower` | First follower received | `{"login": "defunkt"}` |
| `firstPublicEvent` | First public activity | `{"type": "CreateEvent", "created_at": "..."}` |
| `firstRelease` | First release created | `{"tag_name": "v1.0.0", "created_at": "..."}` |
| `firstComment` | First comment made | `{"issue_number": 1, "created_at": "..."}` |
| `firstWatch` | First repository watched | `{"full_name": "defunkt/defunkt", "created_at": "..."}` |
| `firstContribution` | First contribution to others' repos | `{"type": "PR", "repo": "defunkt/defunkt", "created_at": "..."}` |

## Notes

- All date fields are in ISO 8601 format (UTC)
- Some fields may be `null` if the user hasn't performed that activity
- The action gracefully handles missing data and continues processing
- Rate limiting is handled automatically by the GitHub API client
- The summary output is automatically added to the GitHub Actions step summary when available

## Error Handling

If the action fails, check the logs for specific error messages. Common issues include:

- Invalid GitHub username format
- Insufficient token permissions
- Rate limiting (temporary)
- Network connectivity issues

The action will provide detailed error messages to help diagnose and resolve issues.
