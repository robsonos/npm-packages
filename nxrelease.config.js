const { execFileSync } = require('child_process');

const writerOpts = () => {
  return {
    finalizeContext: (context, options, commits, keyCommit) => {
      const getGitHubUsername = (email) => {
        // Get username from noreply email
        if (email.endsWith('@users.noreply.github.com')) {
          const match = email.match(
            /^(\d+\+)?([^@]+)@users\.noreply\.github\.com$/
          );
          if (match && match[2]) {
            return match[2];
          }
        }

        // Get username from GitHub API
        try {
          const response = JSON.parse(
            execFileSync('gh', ['api', `/search/users?q=${email}`], {
              encoding: 'utf8',
            })
          );

          return response.items && response.items[0]?.login
            ? response.items[0].login
            : '';
        } catch (err) {
          console.warn(
            `Failed to fetch GitHub username for email: ${email}`,
            err
          );
          return '';
        }
      };

      const isFirstTimeContributor = (username, context) => {
        // Get commits by this user
        try {
          const commits = JSON.parse(
            execFileSync(
              'gh',
              [
                'api',
                `/repos/${context.owner}/${context.repository}/commits?author=${username}&per_page=1`,
              ],
              { encoding: 'utf8' }
            )
          );

          return commits.length === 0;
        } catch (err) {
          console.warn(`Error checking contributions for ${username}:`, err);

          // Assume not first-time if an error occurs
          return false;
        }
      };

      const createContributors = (commits, context) => {
        const authors = Object.entries(
          commits.reduce((obj, commit) => {
            const { name, email } = commit.raw.author || {};
            if (email && name) {
              if (!obj[name]) {
                obj[name] = { emails: new Set(), username: `@${name}` };
              }
              obj[name].emails.add(email);
            }
            return obj;
          }, {})
        );

        return authors.map(([name, data]) => {
          const emailArray = Array.from(data.emails);
          let username = '';
          let isFirstTime = false;

          for (const email of emailArray) {
            username = getGitHubUsername(email);
            if (username) {
              // Replace with your repo
              isFirstTime = isFirstTimeContributor(username, context);

              // Stop after finding a valid username
              break;
            }
          }

          return {
            name,
            username: username ? `@${username}` : '',
            firstTime: isFirstTime,
          };
        });
      };

      context.contributors = createContributors(commits, context);

      return context;
    },
    mainTemplate: `
{{> header}}

{{#if noteGroups}}
{{#each noteGroups}}

### ⚠ {{title}}

{{#each notes}}
* {{#if commit.scope}}**{{commit.scope}}:** {{/if}}{{text}}
{{/each}}
{{/each}}
{{/if}}
{{#each commitGroups}}

{{#if title}}
### {{title}}

{{/if}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}

{{/each}}

{{> footer}}
`,
    footerPartial: `
{{#if contributors~}}
### ❤️ Thank You

{{#each contributors}}
- {{name}} {{username}} {{#if firstTime}}(🎉 First-time contributor!){{/if}}
{{/each}}
{{/if}}
`,
  };
};

/**
 * @type {import('@theunderscorer/nx-semantic-release/src/executors/semantic-release/schema.json')}
 */
module.exports = {
  repositoryUrl: 'https://github.com/robsonos/npm-packages',
  tagFormat: '${PROJECT_NAME}@v${version}',
  buildTarget: '${PROJECT_NAME}:build',
  outputPath: 'dist/packages/${PROJECT_NAME}',
  gitAssets: ['${PROJECT_DIR}/docs/coverage/badge.svg'],
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  preset: 'conventionalcommits',
  presetConfig: {
    types: [
      { type: 'feat', section: '🚀 Features' },
      { type: 'fix', section: '🩹 Fixes' },
      { type: 'perf', section: '🔥 Performance' },
      { type: 'refactor', section: '💅 Refactors', hidden: true },
      { type: 'docs', section: '📖 Documentation', hidden: true },
      { type: 'build', section: '📦 Build', hidden: true },
      { type: 'types', section: '🌊 Types', hidden: true },
      { type: 'chore', section: '🏡 Chore', hidden: true },
      { type: 'examples', section: '🏀 Examples', hidden: true },
      { type: 'test', section: '✅ Tests', hidden: true },
      { type: 'style', section: '🎨 Styles', hidden: true },
      { type: 'ci', section: '🤖 CI', hidden: true },
      { type: 'revert', section: '⏪ Revert', hidden: true },
    ],
  },
  writerOpts: writerOpts(),
};
