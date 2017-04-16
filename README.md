# Mastodon Model patch for Taberareloo

You can register your Mastodon instance as well at the end of the script and install it.

```
/*
  register('Local', 'http://localhost:3000', {
    sensitive    : false, // or true to hide an image
    spoiler_text : "",    // any text before "SHOW MORE"
    visibility   : ""     // "public", "unlisted", "private", "direct", or "" for your default
  });
*/
  register('Octodon', 'https://octodon.social');
  register('MSTDN.JP', 'https://mstdn.jp');
})();
```
