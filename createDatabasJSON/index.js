"use strict";

var fs = require('fs');
var url = './ebook.json';

// trans ebook to catalogs.json and contents.json
/*
fs.readFile(url, function (err, data) {
  if (err) return;
  
  var ebook = JSON.parse(data);
  var catalogs = [];
  var contents = [];
  
  for (let i = 0; i < ebook.length; ++i) {
    var chapter = new Chapter();
    chapter.chapter_id = "" + i;  // num to string
    chapter.chapter_title = trim(ebook[i].chapter_title);
    
    for (let j = 0; j < ebook[i].chapter_content.length; ++j) {
      var s_b = new Section_brif();
      s_b.section_id = i + "." + j;  // num to string
      s_b.section_title = trim(ebook[i].chapter_content[j].section_title);
      chapter.sections.push(s_b);
      
      // push to contents
      var s = new Section(s_b);
      s.section_content = ebook[i].chapter_content[j].section_content;
      contents.push(s);
    }
    
    // push to catalogs
    catalogs.push(chapter);
  }
  
  // create catalogs.json
  for (let i = 0; i < catalogs.length; ++i) {
    fs.appendFile('catalogs.json', JSON.stringify(catalogs[i]) + '\n', 'utf-8', function (err) {
      if (err) return;
    })
  }
  
  // create contents.json
  for (let i = 0; i < contents.length; ++i) {
    fs.appendFile('contents.json', JSON.stringify(contents[i]) + '\n', 'utf-8', function (err) {
      if (err) return;
    })
  }
})
*/

// trans homepage.json to homepages.json
fs.readFile('homepage.json', function (err, data) {
  if (err) return;
  
  var hp = JSON.parse(data);
  
  for (let i = 0; i < hp.length; ++i) {
    fs.appendFile('homepages.json', JSON.stringify(hp[i]) + '\n', 'utf-8', function (err) {
      if (err) return;
    })
  }
})

function Chapter() {
  this.chapter_id = "",
  this.chapter_title = "",
  this.sections = []
}

function Section_brif() {
  this.section_id = "",
  this.section_title = ""
}

function Section(s_b) {
  this.section_id = s_b.section_id,
  this.section_title = s_b.section_title,
  this.section_content = []
}

function trim(str){   
  str = str.replace(/^(\s|\u00A0)+/,'');   
  for(var i=str.length-1; i>=0; i--){   
    if(/\S/.test(str.charAt(i))){   
      str = str.substring(0, i+1);   
      break;   
    }   
  }   
  return str;   
 }  