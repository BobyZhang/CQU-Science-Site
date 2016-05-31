"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HomepageItem = function () {
  function HomepageItem() {
    _classCallCheck(this, HomepageItem);

    // container
    this.item = new $('<div></div>');
    this.item.addClass('items').addClass('col-md-4').addClass('col-sm-4').addClass('col-xs-12');

    // title and sub-title
    this.titleContainer = new $('<h3 class="title"></h3>');
    this.title = new $('<a></a>');
    this.subTitle = new $('<p class="sub-title"></p>');
    this.titleContainer.append(this.title).append(this.subTitle);

    // cover
    this.coverContainer = new $('<a></a>');
    this.cover = new $('<img class="imgs">');
    this.coverContainer.append(this.cover);

    // items' brif
    this.brif = new $('<p class="detail"></p>');

    // package
    this.item.append(this.titleContainer).append(this.coverContainer).append(this.brif);

    return this;
  }

  _createClass(HomepageItem, [{
    key: 'init',
    value: function init(item) {
      this.title.html(item.sectTitle);
      this.title.attr('data-section', item.section);
      this.subTitle.html(item.sectTitle_en);

      this.coverContainer.attr('data-section', item.section);
      this.cover.attr('src', item.cover_url);

      this.brif.html(item.brif);

      // bind click event
      var that = this;
      this.title.click(function () {
        var section = that.title.attr('data-section');
        sendContentRequest(section, function () {
          $('.homepage-content').css('display', 'none');
          $('.article-content').css('display', 'block');
          // change the sub list style
          changeNavStyle($('#sub-nav ul li'), 'curr-list', section);
          // change the main nav list style
          changeNavStyle($('.main-nav .nav-list a'), 'curr', section.split('.')[0] + '.0');
        });
      });
      this.coverContainer.click(function () {
        var section = that.title.attr('data-section');
        sendContentRequest(section, function () {
          $('.homepage-content').css('display', 'none');
          $('.article-content').css('display', 'block');
          // change the sub list style
          changeNavStyle($('#sub-nav ul li'), 'curr-list', section);
          // change the main nav list style
          changeNavStyle($('.main-nav .nav-list a'), 'curr', section.split('.')[0] + '.0');
        });
      });
    }
  }, {
    key: 'node',
    value: function node() {
      return this.item;
    }
  }]);

  return HomepageItem;
}();