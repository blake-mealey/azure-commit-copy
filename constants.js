const DEFAULT_FORMAT_STRING = 'Committed:\n' +
'* Commit: [${commit.hash}|${commit.url}]\n' +
'${builds}';

const DEFAULT_BUILD_FORMAT_STRING = '* ${build.name}: [${build.id}|${build.url}]\n';

const COMMIT_URL_REGEX = /^https:\/\/(dev\.azure\.com|.+\.visualstudio\.com)(\/.+\/_git\/.+\/commit\/\b[0-9a-f]{5,40}\b)\/?$/;
const BUILD_URL_REGEX = /^https:\/\/(dev\.azure\.com|.+\.visualstudio\.com)(.+\/_build(\/|%2F)results\/?\?buildId=.+)$/;