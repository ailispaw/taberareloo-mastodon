// ==Taberareloo==
// {
//   "name"        : "Quote Extractor for Mastodon"
// , "description" : "Extract a toot on a Mastodon instance"
// , "include"     : ["content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.1.1"
// , "downloadURL" : "https://raw.githubusercontent.com/ailispaw/taberareloo-mastodon/master/extractor.mastodon.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register([
  {
    name : 'Quote - Mastodon',

    saved_node : null,

    isMastodon : function (ctx) {
      var powered_by = $X('.//span[contains(concat(" ",@class," ")," powered-by ")]')[0];
      return !!(powered_by && (powered_by.textContent.trim() === "powered by Mastodon"));
    },

    check : function (ctx) {
      var node = ctx.target;
      this.saved_node =
        $X('./ancestor-or-self::div[contains(concat(" ",@class," ")," entry ")]', node)[0];
      return (this.isMastodon(ctx) && !!this.saved_node);
    },

    extract : function (ctx) {
      var toot     = this.saved_node;
      var link     = toot.querySelector('a.u-url.u-uid');
      var image    = toot.querySelector('a.u-photo');
      var username = toot.querySelector('.display-name strong').textContent;
/*
      var useraddr = toot.querySelector('.display-name span').textContent;
      var domain   = link.href.extract(/https?:\/\/([^\/]+)\//);
      if (useraddr.indexOf(domain) === -1) {
        useraddr = useraddr + '@' + domain;
      }
*/

      var selection;
      if (ctx.selection) {
        selection = ctx.selection;
      } else {
        var elm = toot.querySelector('.status__content .e-content p') ||
          toot.querySelector('.status__content .e-content');
        var cloneElm = elm.cloneNode(true);
        selection = createFlavoredString(cloneElm);
      }

      ctx.title = username; // + '<' + useraddr + '>';
      ctx.href  = link.href;
      return {
        type    : image ? 'photo' : 'quote',
        item    : ctx.title,
        itemUrl : image ? image.href : link.href,
        body    : selection.raw,
        flavors : {
          html : selection.html
        }
      }
    }
  },
  {
    name : 'Quote - Mastodon Dashboard',

    saved_node : null,

    isMastodon : function(ctx) {
      return !!($X('.//div[@data-react-class="Mastodon"]')[0] || $X('.//div[@id="mastodon"]')[0]);
    },

    check : function (ctx) {
      var node = ctx.target;
      this.saved_node = 
        $X('./ancestor-or-self::div[contains(concat(" ",@class," ")," status ")]', node)[0];
      return (this.isMastodon(ctx) && !!this.saved_node);
    },

    extract : function (ctx) {
      var toot     = this.saved_node;
      var link     = toot.querySelector('a.status__relative-time');
      var image    = $X('.//a[starts-with(@style,"background: url")]', toot)[0] ||
        $X('.//a[starts-with(@style,"background-image: url")]', toot)[0];
      var username = toot.querySelector('.display-name strong').textContent;
//      var useraddr = toot.querySelector('.display-name span').textContent;

      var selection;
      if (ctx.selection) {
        selection = ctx.selection;
      } else {
        var elm = toot.querySelector('.status__content p') || toot.querySelector('.status__content');
        var cloneElm = elm.cloneNode(true);
        selection = createFlavoredString(cloneElm);
      }

      ctx.title = username; // + '<' + useraddr + '>';
      ctx.href  = link.href;
      return {
        type    : image ? 'photo' : 'quote',
        item    : ctx.title,
        itemUrl : image ? image.href : link.href,
        body    : selection.raw,
        flavors : {
          html : selection.html
        }
/*      ,
        favorite : {
          name : 'Mastodon',
          id   : link.href.match(/updates\/(\d+)/)[2]
        }
*/
      }
    }
  }
  ], 'Photo - image link');
})();
