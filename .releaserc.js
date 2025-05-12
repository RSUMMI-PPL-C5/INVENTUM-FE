module.exports = {
    branches: ['main', {name: 'staging', prerelease: true}],
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/changelog',
      '@semantic-release/npm',
      ['@semantic-release/git', {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }],
      '@semantic-release/github',
      ['@semantic-release/exec', {
        prepareCmd: 'echo "Version: ${nextRelease.version}"',
        publishCmd: 'echo "Published version ${nextRelease.version}"',
        successCmd: 'echo "Release successful!"'
      }]
    ]
  }