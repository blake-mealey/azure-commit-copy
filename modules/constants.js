export const DEFAULT_FORMAT_STRING = `Committed to [\${branch.name}|\${branch.url}]:
* Pull Request: [\${pullRequest.id}|\${pullRequest.url}]
* Commit: [\${commit.hash}|\${commit.url}]
\${buildsString}`;

export const DEFAULT_BUILD_FORMAT_STRING = `* \${build.name} Build: [\${build.id}|\${build.url}]\n`;

export const COMMIT_URL_REGEX = /^https:\/\/(dev\.azure\.com|.+\.visualstudio\.com)(\/.+\/_git\/.+\/commit\/\b[0-9a-f]{5,40}\b).*$/;
export const BUILD_URL_REGEX = /^https:\/\/(dev\.azure\.com|.+\.visualstudio\.com)(.+\/_build(\/|%2F)results\/?\?buildId=.+)$/;
