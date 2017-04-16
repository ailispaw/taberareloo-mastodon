// ==Taberareloo==
// {
//   "name"        : "Quote Extractor for Mastodon"
// , "description" : "Extract a toot on a Mastodon instance"
// , "include"     : ["content"]
// , "match"       : ["*://*/*"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.githubusercontent.com/ailispaw/taberareloo-mastodon/master/extractor.mastodon.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  Extractors.register([
  {
    name : 'Quote - Mastodon',

    check : function (ctx) {
      var powered_by = $X('.//span[contains(concat(" ",@class," ")," powered-by ")]')[0];
      return (powered_by && (powered_by.textContent.trim() == "powered by Mastodon"));
    },

    extract : function (ctx) {
      var toot     = $X('.//div[contains(concat(" ",@class," ")," entry-center ")]')[0];
      var link     = toot.querySelector('a.detailed-status__datetime.u-url');
      var username = toot.querySelector('.display-name .p-name').textContent;
      var image    = toot.querySelector('.detailed-status__attachments .u-photo');

      var selection;
      if (ctx.selection) {
        selection = ctx.selection;
      } else {
        var elm = toot.querySelector('.status__content p');
        var cloneElm = elm.cloneNode(true);
        selection = createFlavoredString(cloneElm);
      }

      ctx.title = ctx.title + ' / ' + username;
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

    check : function (ctx) {
      var node = ctx.target;
      this.saved_node = $X('./ancestor-or-self::div[@class="status"]', node)[0];
      return !!$X('.//div[@data-react-class="Mastodon"]')[0] && !!this.saved_node;
    },

    extract : function (ctx) {
      var toot     = this.saved_node;
      var link     = toot.querySelector('a.status__relative-time');
      var username = toot.querySelector('.display-name span').textContent;
      var image    = $X('.//a[starts-with(@style,"background: url")]', toot)[0];

      var selection;
      if (ctx.selection) {
        selection = ctx.selection;
      } else {
        var elm = toot.querySelector('.status__content p');
        var cloneElm = elm.cloneNode(true);
        selection = createFlavoredString(cloneElm);
      }

      ctx.title = ctx.title + ' / ' + username;
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
