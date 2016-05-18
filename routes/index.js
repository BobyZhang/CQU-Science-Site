"use strict";

var express = require('express');
var router = express.Router();
var fs = require('fs');

// For MongoDB
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost/ebook';

// read the ebook first
// var ebookString = fs.readFileSync('ebook.json');
// var ebook = JSON.parse(ebookString);
// console.log('Read ebook success!');

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
          "errcode": 1,
          "errmsg": "Cann't find this section!"
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

/* GET catalogs */
router.get('/api/catalogs', function (req, res) {
  var resData = {};
  
  MongoClient.connect(url, function (err, db) {
    if (err) return;
    
    findCatalogs(db, function (catalogs) {
      if (!catalogs) {
        resData = {
          "errcode": 1,
          "errmsg": "Cann't find the catalogs"
        }
        db.close();
        res.send(JSON.stringify(resData));
        res.end();
      }
      
      resData = {
        "errcode": 0,
        "errmsg": "",
        "sections": []
      }
      // transfer the name 
      for (let i = 0; i < catalogs.length; ++i) {
        var oneSection = new Section(catalogs[i].chapter_id, 
            catalogs[i].chapter_title);
        
        // resData.sections[i].sectList = [];
        for (let j = 0; j < catalogs[i].sections.length;  ++j) {
          var oneSectList = new SectList(catalogs[i].sections[j].section_id,
              catalogs[i].sections[j].section_title);
          oneSection.sectList.push(oneSectList);
          // console.log(j);
          // resData.sections[i].sectList[j].sectNum = 
          // resData.sections[i].sectList[j].sectTitle = ;
        }
        resData.sections.push(oneSection);
      }
      
      db.close();
      res.send(JSON.stringify(resData));
      res.end();
    })
  })
})

/* Updata the content */
router.post('/api/modify', function (req, res) {
  var resData = {};
  var params = {
    "section": req.body.section,
    "content": req.body.contentStr.split('@@') // split
  }
  
  MongoClient.connect(url, function(err, db) {
    if (err) {
      resData = {
        "errcode": 1,
        "errmsg": "Unkown err!"
      }
      res.send(JSON.stringify(resData));
      res.end();
      return;
    }
    
    updateContent(db, params, function() {
      resData = {
        "errcode": 0,
        "errmsg": ""
      }
      res.send(JSON.stringify(resData));
      res.end();
      db.close();
    })
  })
  
})

function Section(chptNum, chptTitle) {
  this.chptNum = chptNum;
  this.chptTitle = chptTitle;
  this.sectList = [];
}
function SectList(sectNum, sectTitle) {
  this.sectNum = sectNum;
  this.sectTitle = sectTitle;
}

function findCatalogs(db, callback) {
  var catalogs = db.collection('catalogs').find().sort({"chapter_id": 1});
  var cataArry = [];
  
  catalogs.each(function (err, doc) {
    if (err) console.log(err);
    
    if (doc != null) {
      cataArry.push(doc);
    } 
    else {
      callback(cataArry);
    }
  })
}

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

function updateContent(db, params, callback) {

  db.collection('contents').updateOne(
    {"section_id": params.section},
    {
      $set: {"section_content": params.content}
    }, function (err, results) {
      console.log(results);
      callback();
    }
  )
}

module.exports = router;
