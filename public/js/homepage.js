"use strict";

class HomepageItem {
  constructor() {
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
  
  init(item) {
    this.title.html(item.sectTitle);
    this.title.attr('data-section', item.section);
    this.subTitle.html(item.sectTitle_en);
    
    this.coverContainer.attr('data-section', item.section);
    this.cover.attr('src', item.cover_url);
    
    this.brif.html(item.brif);
    
    // bind click event
    var that = this;
    this.title.click(function () {
      var section = that.title.attr('data-section')
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
      var section = that.title.attr('data-section')
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
  
  node() {
    return this.item;
  }
}