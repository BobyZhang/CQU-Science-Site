"use strict";

var express = require('express');
var router = express.Router();
var fs = require('fs');

// For MongoDB
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost/ebook';

// read the ebook first
var ebookString = fs.readFileSync('ebook.json');
var ebook = JSON.parse(ebookString);
console.log('Read ebook success!');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET content*/
router.get('/api/content', function (req, res) {
  // var sect = req.query.section;
  // var chptString = sect.split('.');
  // var chpt = [];
  
  // for (var i = 0; i < chptString.length; ++i) chpt.push(parseInt(chptString[i]));
  
  // if (chpt.length != 2 || chpt[0] >= ebook.length 
  //     || chpt[1] >= ebook[chpt[0]].chapter_content.length) {
  //   res.write('404, NOT FOUND!');
  //   res.end();
  //   return;
  // }
  
  // var resData = {};
  // var sectList = [];
  // for (var i = 0; i < ebook[chpt[0]].chapter_content.length; ++i) {
  //   sectList.push(ebook[chpt[0]].chapter_content[i].section_title);
  // }
  
  // // the data
  // resData.sectList = sectList;
  // resData.content = ebook[chpt[0]].chapter_content[chpt[1]].section_content;
  // resData.currChpt = chpt;
  
  // res.send(JSON.stringify(resData));
  // res.end();
  
  var section = req.query.section;
  var resData = {};
  
  MongoClient.connect(url, function (err, db) {
    if (err) return;
    
    findContent(db, section, function (sectionList, sect) {
      // don't hava this section
      if (!sectionList || !sect) {
        resData = {
          errcode: 1,
          errmsg: "Cann't find this section!"
        }
        res.send(JSON.stringify(resData));
        res.end();
        return;
      } 
      
      // organize resData
      resData = {
        "errcode": 0,
        "errmsg": "",
        "sectList": [],
        "section": section,
        "content": sect.section_content,
        "prev": {
          "section": "",
          "sectTitle": ""
        },
        "next": {
          "section": "",
          "sectTitle": ""
        }
      }
      
      for (let i = 0; i < sectionList.length; ++i) {
        resData.sectList.push(sectionList[i].section_title);
      }
      
      var sectionArry = section.split('.');
      var chptNum = parseInt(sectionArry[0]);
      var sectNum = parseInt(sectionArry[1]);
      
      var prevSectNum = sectNum - 1;
      var nextSectNum = sectNum + 1;
      
      // if exceed the range, defaut return ""
      if (prevSectNum >= 0) {
        resData.prev = {
          "section": chptNum + '.' + prevSectNum,
          "sectTitle": resData.sectList[prevSectNum]
        }
      }
      if (nextSectNum < resData.sectList.length) {
        resData.next = {
          "section": chptNum + '.' + nextSectNum,
          'sectTitle': resData.sectList[nextSectNum]
        }
      }
      
      db.close();
      res.send(JSON.stringify(resData));
      res.end();
    })
  })
}) 

function findContent(db, section, callback) {
  var sections = null;
  var sect = null;
  
  // get the section list
  var chpt = db.collection('catalogs').find({"chapter_id": section.split('.')[0]});
  chpt.each(function (err, doc) {
    if (err) console.log(err);
    if (doc != null) {
      sections = doc.sections;
      
      // get the content detail
      var sect = db.collection('contents').find({"section_id": section});
      sect.each(function (err, doc) {
        if (err) console.log(err);
        if (doc != null) {
          sect = doc;
          
          // callback
          callback(sections || null, sect || null);
        }
      })
    }
  });
}

module.exports = router;
