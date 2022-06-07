const config = {
  hooks: {
    "before:init": ["yarn test"],
    // "after:my-plugin:bump": "./bin/my-script.sh",
    "after:bump": "yarn build",
    "after:git:release": "echo After git push, before github release",
    "after:release": "echo Successfully released ${name} v${version} to ${repo.repository}."
  },
  npm: {
    publishConfig: {
      access: "public",
    },
  },
  git: {
    requireCleanWorkingDir: false,
    changelog: 'git log --pretty=format:"* %s (%h)" ${from}...${to}',
    commitMessage: 'chore: release v${version}',
    requireBranch: 'master',
    tagName: "v${version}",
  },
  github: {
    release: false,
    releaseName: "Release v${version}",
    preRelease: true,
    autoGenerate: true,
    tokenRef: "GITHUB_TOKEN",
    assets: null,
  },
}

module.exports = config
