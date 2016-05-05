var fs = require('fs');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

fs.readFile('./science.htm', function (err, data) {
  if (err) {
    throw err;
  }
  
  var html = iconv.decode(data, 'gbk');
  var $ = cheerio.load(html, {decodeEntities: false});
  
  var ebook = [];
  var chpt = new Chapter();
  var sect = new Section();
  
  parsing($('.WordSection2'), ebook, chpt, sect, $);
  parsing($('.WordSection3'), ebook, chpt, sect, $);
  parsing($('.WordSection4'), ebook, chpt, sect, $);
  parsing($('.WordSection5'), ebook, chpt, sect, $);
  parsing($('.WordSection6'), ebook, chpt, sect, $);
  
  // console.log(ebook[2].chapter_content);
  
  // write to file
  fs.writeFile('ebook.json', JSON.stringify(ebook), function (err) {
    if (err) throw err;
    console.log('write success!');
  })
});

var parsing = function (fatherElement, ebook, chpt, sect, $) {
  fatherElement.children().each(function (i, element) {
    // console.log($(element)[0].name);
    // console.log('--------------------------------------------------------------');
    var e = $(this);
    // console.log(typeof e.text());
    if (element.name.toLowerCase() == 'h1') {
      // handle the fisrt
      if (chpt.chapter_title != "") {
        // Push the section first
        chpt.chapter_content.push(sect);
        // then push the chpter
        ebook.push(chpt);
      }
      
      // init chpt
      chpt = new Chapter();
      chpt.chapter_title = e.text().split(";")[1];
      // console.log(chpt);
      // init sect
      sect = new Section();
    }
    
    else if (element.name.toLowerCase() == 'h3') {
      
      // handle the first
      if (sect.section_title != "") {
        chpt.chapter_content.push(sect);
      }
      
      sect = new Section();
      var temp = e.text().split(";");
      sect.section_title = temp[temp.length - 1];
      // console.log(sect);
      // console.log(chpt);
    }
    
    else if (element.name.toLowerCase() == 'p') {
      // console.log(e.find('img'));
      // img or p or p after img
      if (e.find('img').length == 0) {
        sect.section_content.push(e.text());
      }
      else {
        e.find('img').each(function (index, img) {
          var imgURL = $(this).attr('src');
          sect.section_content.push(imgURL);
          // console.log(sect);
        })
      }
    }
    
    // Push the last
    if (i == fatherElement.children().length - 1) {
      // Push the section first
      chpt.chapter_content.push(sect);
      // then push the chpter
      ebook.push(chpt);
      
      // init chpt and sect
      sect = new Section();
      chpt = new Chapter();
    }
    
  });
}

var Chapter = function (){
  this.chapter_title = "",
  this.chapter_content = []
}

var Section = function () {
  this.section_title = "",
  this.section_content = []
}