module.exports = function(source, file, opts) {
    if (source in opts) {
        return opts[source];
    }
};
