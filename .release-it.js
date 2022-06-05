const config = {
  hooks: {
    "before:init": ["yarn test"],
    // "after:my-plugin:bump": "./bin/my-script.sh",
    "after:bump": "yarn build",
    "after:git:release": "echo After git push, before github release",
    "after:release": "echo Successfully released ${name} v${version} to ${repo.repository}."
  },
  npm: {
    publishArgs: ['--access=public'],
  },
  git: {
    "requireCleanWorkingDir": false,
    changelog: 'git log --pretty=format:"* %s (%h)" ${from}...${to}',
    commitMessage: 'chore: release v${version}',
    requireBranch: 'master',
  },
  "github": {
    "release": false,
    "releaseName": "Release ${version}",
    "releaseNotes": null,
    "autoGenerate": false,
    "preRelease": false,
    "draft": false,
    "tokenRef": "GITHUB_TOKEN",
    "assets": null,
    "host": null,
    "timeout": 0,
    "proxy": null,
    "skipChecks": false,
    "web": false
  },
}

module.exports = config
