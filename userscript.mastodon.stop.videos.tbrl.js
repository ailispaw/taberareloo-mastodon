// ==Taberareloo==
// {
//   "name"        : "Stop Videos on a Mastodon Dashboard"
// , "description" : "Stop all videos on a Mastodon dashboard"
// , "include"     : ["content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.2.0"
// , "downloadURL" : "https://raw.githubusercontent.com/ailispaw/taberareloo-mastodon/master/userscript.mastodon.stop.videos.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  if (!$X('.//div[@data-react-class="Mastodon"]')[0]) return;

  var timer = null;

  function stopVideos () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    var videos = document.getElementsByTagName('video');
    for (var i = 0 ; i < videos.length ; i++) {
      if (!videos[i].getAttribute('controls')) {
        if (!$X('ancestor-or-self::div[contains(concat(" ",@class," ")," media-modal ")]', videos[i])[0]) {
          videos[i].pause();
        }
        videos[i].loop = false;
        videos[i].setAttribute('controls', 'controls');
      }
    }

    timer = setTimeout(stopVideos, 1000);
  }

  stopVideos();
})();
