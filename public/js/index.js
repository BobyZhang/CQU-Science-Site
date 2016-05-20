// "use strict";

// import { request } from 'request.js';

$(document).ready(function (){
  
  // addListener back to top
  //首先将#back-to-top隐藏
  $(".back-to-top").hide();
  //当滚动条的位置处于距顶部100像素以下时，跳转链接出现，否则消失
  $(window).scroll(function () {
    if ($(window).scrollTop() > 500) {
      $(".back-to-top").fadeIn(500);
    }
    else {
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
    $('.nav-list a').css({fontWeight: 'normal'});
    $(this).css({fontWeight: 'bold'});
    
    if ($(this).attr('id') == 'homepage') {
      // switch the main display content
      $('.homepage-content').css({display: 'block'});
      $('.article-content').css({display: 'none'});
    } else {
      // switch the main display content
      $('.homepage-content').css({display: 'none'});
      $('.article-content').css({display: 'block'});
      // send request
      var chpt = $(this).attr('id').split('-')[1];
      sendContentRequest(chpt, function() {
        // change the list style
        $('.sub-nav ul li').removeClass('curr-list');
        console.log($(('.s-' + chpt)));
        $(('.s-' + chpt)).addClass('curr-list');
      });
    }
    
  });
  
  // handle sub-nav click
  // bindSubNavClick($('.sub-nav ul li'));
});

function sendContentRequest(section, callback) {
  // var url = '/api/content?section=' + section;
  
  // $.ajax({
  //   type: 'GET',
  //   url: url
  // })
  // .done(function(resData) {
  //   var data = JSON.parse(resData);
  //   handleContentRequest(data);
    
  //   // scroll the page
  //   var currPosY = $(document).scrollTop();
  //   var articlePosY = $('article').offset().top;
    
  //   if (currPosY > articlePosY) {
  //     $('body').animate({scrollTop: articlePosY});
  //   }
    
  // });
  
  request.getContent(section, function(resData) {
    // detect error
    if (resData.errcode == 1) {
      alert(resData.errmsg);
      return ;
    }
    
    handleContentRequest(resData);
    
    callback();
  });
}

// class
class Article {
  constructor() {
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
  
  setTitle(title) {
    this.title.html(title);
  }
  
  setContent(contentArry) {
    // set strategies
    var strateges = {
      "isText": function(container, content) {
        container.append(content);
        container.append('<br><br>');
      },
      "isDefine": function(container, content) {
        var imgExplain = new $('<p class="img-explain"></p>');
        imgExplain.html(content.split('/')[1]);
        
        container.append(imgExplain);
        container.append('<br>');
      },
      "isVideo": function(container, content) {
        var newVideo = new $('<video class="article-video" controls=""controls>您的浏览器不支持 video 标签。</video>');
        newVideo.attr('src', content);
        
        container.append(newVideo);
        container.append('<br>');
      },
      "isImg": function(container, content) {
        var newImg = new $('<img>');
        newImg.attr('src', content);
        
        container.append(newImg);
      },
      "isImgsSet": function(container, content) {
        container.append(content);
        // container.append('<br>');
      }
    }
    var addToContent = function(level, container, content) {
      return strateges[level](container, content);
    }
    
    var content = new $('<p></p>');
    var imgsSet = new $('<div class="imgs-set"></div>');  // for handle a lot of imgs in one line
    
    for (let i = 0; i < contentArry.length; ++i) {
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
          addToContent('isDefine', content, contentArry[i])
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
  
  setPageTuningPrev(section, sectTitle) {
    this.ptPrev.html(""); // init
    
    if (sectTitle == "") return;
    
    this.ptPrev.html('&lt; ' + sectTitle);
    // be deleted
    this.ptPrev.removeClass().addClass('s-' + section);
    this.ptPrev.attr('data-section', section);
  }
  
  setPageTuningNext(section, sectTitle) {
    this.ptNext.html(""); // init
    
    if (sectTitle == "") return;

    this.ptNext.html(sectTitle + ' &gt;');
    this.ptNext.removeClass().addClass('s-' + section);
    this.ptNext.attr('data-section', section);
  }
  
  init(resData) {
    // set the article tittle
    this.setTitle(resData.sectTitle);
    
    // set the content
    this.setContent(resData.content);
    
    // set the page tuning
    this.setPageTuningPrev(resData.prev.section, resData.prev.sectTitle);
    this.setPageTuningNext(resData.next.section, resData.next.sectTitle);
  }
  
  node() {
    return this.article;
  }
}

class SubNav {
  constructor() {
    this.list = new $('<ul></ul>');
    
    return this;
  }
  
  setSubNavList(sectList) {
    this.list.html("");    // init
    
    for (let i = 0; i < sectList.length; ++i) {
      var items = new $('<li></li>');
      items.addClass('s-' + sectList[i].section);
      items.attr('data-section', sectList[i].section);
      items.html(sectList[i].sectTitle);
      // bind click event
      bindSubNavClick(items);
      
      this.list.append(items);
    }
  }
  
  node() {
    return this.list;
  }
}

var createSingleArticle = (function () {
  var oneArticle;
  return function () {
    if (!oneArticle) {
      oneArticle = new Article();
    }
    return oneArticle;
  }
})();

var createSingleSubNav = (function () {
  var subNav;
  return function () {
    if (!subNav) {
      subNav = new SubNav();
    }
    return subNav;
  }
})();

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
  
  /*
  var sA = data.section.split('.');
  var currChpt = [];
  currChpt.push(parseInt(sA[0]));
  currChpt.push(parseInt(sA[1]));
  
  
  // Change the sub-list first
  if (!isSameChapter(currChpt)) {
    $('.sub-nav ul').html("");
    
    for (var i = 0; i < data.sectList.length; ++i) {
      // add class name
      var list = new $('<li class="s-' + currChpt[0] + '.' + i + '"></li>');
      // add the list
      list.html(data.sectList[i]);
      $('.sub-nav ul').append(list);
    }
    bindSubNavClick($('.sub-nav ul li')); // Bind sub-nav click
  }
  // change sub-nav style
  $('.sub-nav ul li').removeClass('curr-list');
  $($('.sub-nav ul li')[currChpt[1]]).addClass('curr-list');
  
  // Change the content
  $('article .title').html(data.sectList[currChpt[1]]);  // change title
  var content = new $('<p></p>');  // change content
  var imgsSet = new $('<div class="imgs-set"></div>');
  for (var i = 0, lastIsImg = false; i < data.content.length; ++i) {
    // judge whether is img
    if (data.content[i].indexOf('imgs/') >= 0) {
      lastIsImg = true;
      var newImg = new $('<img src="' + data.content[i] + '">');
      imgsSet.append(newImg);
    }
    // not img
    else {
      if (lastIsImg) {
        // push the imgs-set fist
        content.append(imgsSet);
        var imgsSet = new $('<div class="imgs-set"></div>');
        // then push the img explain
        var imgExplain = new $('<p class="img-explain"></p>');
        imgExplain.html(data.content[i]);
        content.append(imgExplain);
        lastIsImg = false;
        
        content.append('<br/>');
      }
      else {
        content.append(data.content[i]);
        lastIsImg = false;
        content.append('<br/><br/>');
      }
      
    }
  }
  $('article .content').html(content);
  
  // add prev and next
  $('.page-tuning').html("");
  
  var prev = $('<a href="javascript:;" id="prev"></a>');
  var next = $('<a href="javascript:;" id="next"></a>');
  
  if (data.prev.sectTitle != "") {
    $(prev).addClass('s-' + data.prev.section);
    $(prev).html('&lt; ' + data.prev.sectTitle);
    bindSubNavClick($(prev));
  }
  if (data.next.sectTitle != "") {
    $(next).addClass('s-' + data.next.section);
    $(next).html(data.next.sectTitle + ' &gt;');
    bindSubNavClick($(next));
  }
  $('.page-tuning').append(prev).append(next);
  */
}

function isSameChapter(chpt) {
  var oneClassName = $($('.sub-nav ul li')[0]).attr('class');
  var curr = oneClassName.split(' ')[0].split('-')[1].split('.');
  if (chpt[0] == parseInt(curr)) {
    return true;
  }
  return false;
}

function isSameSection() {
  
}

//$('.sub-nav ul li')
function bindSubNavClick(elements) {
  elements.click(function () {
    // var chpt = $(this).attr('class').split('-')[1];
    var section = $(this).attr('data-section');
    // send request
    sendContentRequest(section, function() {
      // callback means success
      // change the list style
      $('#sub-nav ul li').removeClass('curr-list');
      console.log($('#sub-nav ul').children('.s-' + section));
      $('.s-' + section).addClass('curr-list');
    });
  });
}

