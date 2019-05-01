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
result.buildUrls = buildLinks.map((link) => link.href);

result;