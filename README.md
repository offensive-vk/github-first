# GitHub First Everything

This GitHub Action fetches the "first of everything" about a GitHub user - their first repository, first commit, first issue, first pull request, and much more! Feel free to give it a try!

## Features

This action discovers and reports on at least 15 different "first" items for any GitHub user:

- 👤 **Account creation date** - When the user joined GitHub
- 📂 **First repository** - The oldest repository they created
- 💾 **First commit** - Their earliest commit across all repositories
- 🐛 **First issue** - The first issue they created
- 🔀 **First pull request** - Their first PR contribution
- 📝 **First gist** - Their oldest gist
- ⭐ **First starred repository** - The first repo they starred
- ⚡ **First workflow run** - Their earliest GitHub Actions run
- 🍴 **First fork** - The first repository they forked
- 🏢 **First organization** - The first organization they joined
- 👥 **First following** - The first person they followed
- 👥 **First follower** - The first person that followed you
- 📅 **First public event** - Their earliest recorded public activity
- 🚀 **First release** - The first release they published
- 💬 **First comment** - Their first comment on an issue/PR
- 👀 **First watched repository** - The first repo they watched
- 🤝 **First contribution** - Their first contribution to someone else's repo

## Usage

```yaml
name: Analyze GitHub User
on:
  workflow_dispatch:
    inputs:
      username:
        description: 'GitHub username to analyze'
        required: true
        type: string

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Analyze User's GitHub History
        id: analyze
        uses: ./
        with:
          username: ${{ inputs.username }}
          token: ${{ secrets.GITHUB_TOKEN }}
          everything: false
      
      - name: Display Results
        run: |
          echo "## 📊 First Everything Report" >> $GITHUB_STEP_SUMMARY
          echo "${{ steps.analyze.outputs.summary }}" >> $GITHUB_STEP_SUMMARY
          
      - name: Save Full Results
        run: |
          echo '${{ steps.analyze.outputs.results }}' > user-analysis.json

```

## Inputs

- `username` (**required**): The GitHub username to analyze/find info about.
- `token` (**required**): GitHub token for API access (use `${{ secrets.GITHUB_TOKEN }}`)
- `everything` (**optional**): Optional flag to show every available information.

## Outputs

- `results`: Complete JSON object containing all discovered "first" items
- `summary`: Human-readable summary of the findings

## Example Output

```txt
📊 First Everything Report for <@username>
==================================================
👤 Account created: 1/25/2011
📂 First repository: Hello-World (1/26/2011)
💾 First commit: 7c258a9 (1/26/2011)
🐛 First issue: #1 (1/26/2011)
🔀 First PR: #1 (1/26/2011)
📝 First gist: aa5a315d61ae9438b18d (4/14/2010)
⭐ First starred repo: defunkt/hubris (3/10/2011)
⚡ First workflow run: CI (5/15/2020)
🍴 First fork: defunkt/facebox (2/20/2011)
🤝 First contribution: user/repo (1/1/2001)
===================================================
```

## Limitations

- Some data may not be available for very old accounts due to GitHub API limitations
- Private repositories and activities are not included unless the token has appropriate permissions
- The "first watched repository" endpoint requires the user's own authentication
- Public events are limited to the last 90 days by GitHub's API

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/offenisive-vk/github-first-everything/issues).