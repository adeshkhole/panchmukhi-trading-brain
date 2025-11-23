// include-header.js — fetch and insert shared header partial
(function() {
    function insertHeader(html) {
        // remove existing navs to avoid duplicates
        document.querySelectorAll('nav.nav-blur').forEach(n => n.remove());

        // create or reuse container
        var container = document.getElementById('site-header');
        if (!container) {
            container = document.createElement('div');
            container.id = 'site-header';
        }
        container.innerHTML = html;
        document.body.prepend(container);

        // signal that header is inserted
        document.dispatchEvent(new Event('header-inserted'));
    }

    // fetch the partial
    try {
        fetch('partials/header.html', {cache: 'no-store'})
            .then(function(resp) {
                if (!resp.ok) throw new Error('Failed to fetch header');
                return resp.text();
            })
            .then(function(html) { insertHeader(html); })
            .catch(function(err) { console.warn('include-header error:', err); });
    } catch (e) {
        console.warn('include-header error', e);
    }
})();
