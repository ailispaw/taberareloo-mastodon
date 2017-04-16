// ==Taberareloo==
// {
//   "name"        : "Mastodon Model"
// , "description" : "Post to a Mastodon instance"
// , "include"     : ["background"]
// , "version"     : "0.1.0"
// , "downloadURL" : "https://raw.githubusercontent.com/ailispaw/taberareloo-mastodon/master/model.mastodon.tbrl.js"
// }
// ==/Taberareloo==

(function() {
  var BASE_URL = 'http://localhost:3000';

  var Mastodon = {
    name      : 'Mastodon',
    ICON      : BASE_URL + '/favicon.ico',
    LINK      : BASE_URL + '/',
    LOGIN_URL : BASE_URL + '/auth/sign_in',

    POST_URL  : BASE_URL + '/api/v1/statuses',
    MEDIA_URL : BASE_URL + '/api/v1/media',

    check : function (ps) {
      return /regular|photo|quote|link|video/.test(ps.type);
    },

    getAccessToken : function () {
      var self = this;

      return request(self.LINK).then(function (res) {
        var access_token = res.responseText.extract(/"access_token":"([^"]+?)"/);
        var default_privacy = res.responseText.extract(/"default_privacy":"([^"]+?)"/);
        return {
          token   : access_token,
          privacy : default_privacy
        };
      });
    },

    createStatus : function (ps) {
      var self     = this;
      var template = TBRL.Config['entry']['twitter_template'];
      var status   = '';

      if (ps.type === 'photo') {
        ps = update({}, ps);
        ps.itemUrl = ps.pageUrl;
      }
      if (!template) {
        status = joinText([
          ps.description,
          (ps.body) ? '"' + ps.body + '"' : '',
          ps.item,
          ps.itemUrl
        ], ' ');
      } else {
        status = templateExtract(template, {
          description   : ps.description,
          description_q : (ps.description) ? '"' + ps.description + '"' : null,
          body          : ps.body,
          body_q        : (ps.body) ? '"' + ps.body + '"' : null,
          title         : ps.item,
          title_q       : (ps.item) ? '"' + ps.item + '"' : null,
          link          : ps.itemUrl,
          link_q        : (ps.itemUrl) ? '"' + ps.itemUrl + '"' : null
        });
      }
      return status;
    },

    post : function (ps) {
      var self = this;
      var promise;

      content = {
        in_reply_to_id : null,
        media_ids      : [],
        sensitive      : false,
        spoiler_text   : "", // "Tooted by Taberareloo"
        status         : self.createStatus(ps),
        visibility     : "public" // "unlisted", "private" or "direct"
      };

      promise = Promise.resolve(content);
      if (ps.type === 'photo') {
        promise = (
          ps.file ? Promise.resolve(ps.file) : download(ps.itemUrl).then(function (entry) {
            return getFileFromEntry(entry);
          })
        ).then(function (file) {
          return self.upload(file).then(function (json) {
            content.media_ids.push(json.id);
            return content;
          });
        });
      }

      return promise.then(function (content) {
        return self.getAccessToken().then(function (token) {
          content.visibility = token.privacy;
          return request(self.POST_URL, {
            method       : 'POST',
            responseType : 'json',
            headers      : {
              'Content-Type'  : 'application/json',
              'Authorization' : 'Bearer ' + token.token
            },
            sendContent  : JSON.stringify(content)
          });
        });
      });
    },

    upload : function (file) {
      var self = this;

      return self.getAccessToken().then(function (token) {
        return request(self.MEDIA_URL, {
          method       : 'POST',
          responseType : 'json',
          headers      : {
            'Authorization' : 'Bearer ' + token.token
          },
          sendContent  : {
            file : file
          }
        }).then(function (res) {
          return res.response;
        });
      });
    }
  };

  function register (name, base_url) {
    var model = update({}, Mastodon);
    model.name      = 'Mastodon - ' + name;
    model.typeName  = 'Mastodon';
    model.ICON      = base_url + '/favicon.ico';
    model.LINK      = base_url + '/';
    model.LOGIN_URL = base_url + '/auth/sign_in';
    model.POST_URL  = base_url + '/api/v1/statuses';
    model.MEDIA_URL = base_url + '/api/v1/media';
    Models.register(model);
  }

  register('Local', 'http://localhost:3000');
  register('Octodon', 'https://octodon.social');
  register('MSTDN.JP', 'https://mstdn.jp');
})();
