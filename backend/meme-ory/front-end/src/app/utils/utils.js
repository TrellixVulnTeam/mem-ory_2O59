export function parseUrl() {
    const url = window.location.href;
    const query = url.split('?')[1] || '';
    const delimiter = '&';

    return query
        .split(delimiter)
        .map(p => p.split('='))
        .reduce((acc, kv) => { acc[kv[0]] = kv[1]; return acc;}, {})
}