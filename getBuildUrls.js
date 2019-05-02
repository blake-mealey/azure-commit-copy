var BUILD_LINK_REGEX = /^(?<name>.+) (?:build) (?<instance>.+) (?<status>\w+)$/;

var result = {
    buildUrls: []
};

function getBuildLinks() {
    return Array.from(document.querySelectorAll('.status-target-url-link'));
}

var buildLinks = getBuildLinks();
if (!buildLinks || buildLinks.length === 0) {
    document.querySelector('.status-state').click();
    buildLinks = getBuildLinks();
}

result.builds = buildLinks
    .filter((link) => BUILD_LINK_REGEX.test(link.textContent))
    .map((link) => {
        return {
            url: link.href,
            name: BUILD_LINK_REGEX.exec(link.textContent).groups.name
        };
    });

result;
