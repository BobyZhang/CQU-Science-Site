"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// "use strict";

// import { request } from 'request.js';

$(document).ready(function () {

  // addListener back to top
  //首先将#back-to-top隐藏
  $(".back-to-top").hide();
  //当滚动条的位置处于距顶部100像素以下时，跳转链接出现，否则消失
  $(window).scroll(function () {
    if ($(window).scrollTop() > 500) {
      $(".back-to-top").fadeIn(500);
    } else {
      $(".back-to-top").fadeOut(500);
    }
  });
  //当点击跳转链接后，回到页面顶部位置
  $(".back-to-top").click(function () {
    $('body,html').animate({ scrollTop: 0 }, 250);
    return false;
  });

  // addListener main nav
  $('.nav-list a').click(function () {
    // change the style first
    $('.nav-list a').removeClass('curr');
    $(this).addClass('curr');

    if ($(this).attr('id') == 'homepage') {
      // switch the main display content
      $('.homepage-content').css({ display: 'block' });
      $('.article-content').css({ display: 'none' });
    } else {

      // send request
      var section = $(this).attr('id').split('-')[1];
      sendContentRequest(section, function () {
        // switch the main display content
        $('.homepage-content').css({ display: 'none' });
        $('.article-content').css({ display: 'block' });

        // change the list style
        changeNavStyle($('#sub-nav ul li'), 'curr-list', section);
      });
    }
  });

  // request the homepage
  homepageItemsRequest($('.show-module'));
});

function changeNavStyle(nav, className, section) {
  nav.removeClass(className);
  $(nav.selector + '[data-section="' + section + '"]').addClass(className);
}

function sendContentRequest(section, callback) {

  //   // scroll the page
  //   var currPosY = $(document).scrollTop();
  //   var articlePosY = $('article').offset().top;

  //   if (currPosY > articlePosY) {
  //     $('body').animate({scrollTop: articlePosY});
  //   }

  // });

  request.getContent(section, function (resData) {
    // detect error
    if (resData.errcode == 1) {
      alert(resData.errmsg);
      return;
    }

    handleContentRequest(resData);

    callback();
  });
}

// class

var Article = function () {
  function Article() {
    _classCallCheck(this, Article);

    this.article = new $('<article></article>');
    this.title = new $('<h3 class="title"></h3>');
    this.content = new $('<div class="content"></div');
    this.pageTuning = new $('<div class="page-tuning"></div>');
    this.ptPrev = new $('<a href="javascript:;" id="prev"></a>');
    this.ptNext = new $('<a href="javascript:;" id="next"></a>');

    // pakage as an article
    this.pageTuning.append(this.ptPrev).append(this.ptNext);
    this.article.append(this.title).append(this.content).append(this.pageTuning);

    // bind page turning click
    bindSubNavClick(this.ptPrev);
    bindSubNavClick(this.ptNext);

    return this;
  }

  _createClass(Article, [{
    key: "setTitle",
    value: function setTitle(title) {
      this.title.html(title);
    }
  }, {
    key: "setContent",
    value: function setContent(contentArry) {
      // set strategies
      var strateges = {
        "isText": function isText(container, content) {
          container.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + content);
          container.append('<br><br>');
        },
        "isDefine": function isDefine(container, content) {
          var imgExplain = new $('<p class="img-explain"></p>');
          imgExplain.html(content.split('/')[1]);

          container.append(imgExplain);
          container.append('<br>');
        },
        "isVideo": function isVideo(container, content) {
          var newVideo = new $('<video class="article-video" controls=""controls>您的浏览器不支持 video 标签。</video>');
          newVideo.attr('src', content);

          // add sub title
          var track = new $('<track label="简体中文" kind="caption">');
          track.attr('src', content.split('.')[0] + '.vtt');
          newVideo.append(track);

          container.append(newVideo);
          container.append('<br>');
        },
        "isImg": function isImg(container, content) {
          var newImg = new $('<img>');
          newImg.attr('src', content);

          container.append(newImg);
        },
        "isImgsSet": function isImgsSet(container, content) {
          container.append(content);
          // container.append('<br>');
        }
      };
      var addToContent = function addToContent(level, container, content) {
        return strateges[level](container, content);
      };

      var content = new $('<p></p>');
      var imgsSet = new $('<div class="imgs-set"></div>'); // for handle a lot of imgs in one line

      for (var i = 0; i < contentArry.length; ++i) {
        // Img
        if (contentArry[i].indexOf('imgs/') >= 0) {
          addToContent('isImg', imgsSet, contentArry[i]);
        }
        // Not an img
        else {
            // Imgs set
            if (imgsSet.html() != "") {
              addToContent('isImgsSet', content, imgsSet);
              imgsSet = new $('<div class="imgs-set"></div>');
            }

            // Defination
            if (contentArry[i].indexOf('define/') >= 0) {
              addToContent('isDefine', content, contentArry[i]);
            }
            // Video
            else if (contentArry[i].indexOf('videos/') >= 0) {
                addToContent('isVideo', content, contentArry[i]);
              }
              // Text
              else {
                  addToContent('isText', content, contentArry[i]);
                }
          }
      }

      this.content.html(content);
    }
  }, {
    key: "setPageTuningPrev",
    value: function setPageTuningPrev(section, sectTitle) {
      this.ptPrev.html(""); // init

      if (sectTitle == "") return;

      this.ptPrev.html('&lt; ' + sectTitle);
      // be deleted
      this.ptPrev.removeClass().addClass('s-' + section);
      this.ptPrev.attr('data-section', section);
    }
  }, {
    key: "setPageTuningNext",
    value: function setPageTuningNext(section, sectTitle) {
      this.ptNext.html(""); // init

      if (sectTitle == "") return;

      this.ptNext.html(sectTitle + ' &gt;');
      this.ptNext.removeClass().addClass('s-' + section);
      this.ptNext.attr('data-section', section);
    }
  }, {
    key: "init",
    value: function init(resData) {
      // set the article tittle
      this.setTitle(resData.sectTitle);

      // set the content
      this.setContent(resData.content);

      // set the page tuning
      this.setPageTuningPrev(resData.prev.section, resData.prev.sectTitle);
      this.setPageTuningNext(resData.next.section, resData.next.sectTitle);
    }
  }, {
    key: "node",
    value: function node() {
      return this.article;
    }
  }]);

  return Article;
}();

var SubNav = function () {
  function SubNav() {
    _classCallCheck(this, SubNav);

    this.list = new $('<ul></ul>');

    return this;
  }

  _createClass(SubNav, [{
    key: "setSubNavList",
    value: function setSubNavList(sectList) {
      this.list.html(""); // init

      for (var i = 0; i < sectList.length; ++i) {
        var items = new $('<li></li>');
        items.addClass('s-' + sectList[i].section);
        items.attr('data-section', sectList[i].section);
        items.html(sectList[i].sectTitle);
        // bind click event
        bindSubNavClick(items);

        this.list.append(items);
      }
    }
  }, {
    key: "node",
    value: function node() {
      return this.list;
    }
  }]);

  return SubNav;
}();

var createSingleArticle = function () {
  var oneArticle;
  return function () {
    if (!oneArticle) {
      oneArticle = new Article();
    }
    return oneArticle;
  };
}();

var createSingleSubNav = function () {
  var subNav;
  return function () {
    if (!subNav) {
      subNav = new SubNav();
    }
    return subNav;
  };
}();

function homepageItemsRequest(container) {
  request.sendHomepageItemsRequest(6, function (resData) {
    if (resData.errcode == 1) {
      alert(resData.errmsg);
      return;
    }

    var row = new $('<div class="row"></div>');
    for (var i = 0; i < resData.count; ++i) {
      var item = new HomepageItem();
      item.init(resData.items[i]);

      row.append(item.node());

      // for one row three item
      if ((i + 1) % 3 == 0) {
        container.append(row);
        row = new $('<div class="row"></div>');
      }
    }
  });
}

function handleContentRequest(data) {

  var article = createSingleArticle();
  var subNav = createSingleSubNav();
  // reload the content
  article.init(data);
  subNav.setSubNavList(data.sectList);

  // when first load
  if ($('#article').children().length == 0) {
    $('#article').append(article.node());
    $('#sub-nav').append(subNav.node());
  }
}

function isSameChapter(chpt) {
  var oneClassName = $($('.sub-nav ul li')[0]).attr('class');
  var curr = oneClassName.split(' ')[0].split('-')[1].split('.');
  if (chpt[0] == parseInt(curr)) {
    return true;
  }
  return false;
}

function isSameSection() {}

//$('.sub-nav ul li')
function bindSubNavClick(elements) {
  elements.click(function () {
    // var chpt = $(this).attr('class').split('-')[1];
    var section = $(this).attr('data-section');
    // send request
    sendContentRequest(section, function () {
      // callback means success
      // change the list style
      changeNavStyle($('#sub-nav ul li'), 'curr-list', section);
    });
  });
}