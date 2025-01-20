const writerOpts = () => {
  return {
    transform: (commit, context) => {
      let discard = true;
      const issues = [];

      commit.notes.forEach((note) => {
        note.title = `### ⚠️  Breaking Changes`;
        discard = false;
      });

      // Add user friendly type
      if (commit.type === 'feat') {
        commit.type = '🚀 Features';
      } else if (commit.type === 'fix') {
        commit.type = '🩹 Fixes';
      } else if (commit.type === 'perf') {
        commit.type = '🔥 Performance';
      } else if (commit.type === 'revert' || commit.revert) {
        commit.type = '⏪ Revert';
      } else if (discard) {
        return;
      } else if (commit.type === 'docs') {
        commit.type = '⏪ Revert';
      } else if (commit.type === 'style') {
        commit.type = '🎨 Styles';
      } else if (commit.type === 'refactor') {
        commit.type = '💅 Refactors';
      } else if (commit.type === 'test') {
        commit.type = '✅ Tests';
      } else if (commit.type === 'build') {
        commit.type = '📦 Build';
      } else if (commit.type === 'ci') {
        commit.type = '🤖 CI';
      }

      // Truncate Commit Hashes
      if (typeof commit.hash === `string`) {
        commit.shortHash = commit.hash.substring(0, 7);
      }

      if (typeof commit.subject === `string`) {
        // Filter out Merge pull request commits
        if (commit.subject.indexOf('Merge pull request') >= 0) {
          return;
        }

        // Filter out repo scope
        if (commit.scope === 'repo') {
          return;
        }

        // Construct Issue Links
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }

        // Create user link from mentions
        if (context.host) {
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) => {
              if (username.includes('/')) {
                return `@${username}`;
              }

              return `[@${username}](${context.host}/${username})`;
            }
          );
        }
      }

      // Remove duplicate references
      commit.references = commit.references.filter((reference) => {
        if (issues.indexOf(reference.issue) === -1) {
          return true;
        }

        return false;
      });

      return commit;
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
  };
};

/**
 * @type {import('@theunderscorer/nx-semantic-release/src/executors/semantic-release/schema.json')}
 */
module.exports = {
  repositoryUrl: 'https://github.com/robsonos/npm-packages',
  tagFormat: '${PROJECT_NAME}@v${version}',
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  writerOpts: writerOpts(),
};
