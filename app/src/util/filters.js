
exports.onlyFolders = (bookmarkLike) => {
    return !!bookmarkLike.children;
}

exports.omitFolders = (bookmarkLike) => {
    return !bookmarkLike.children;
}