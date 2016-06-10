"use strict";

var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable = require('formidable');

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

/* Get content*/
router.get('/api/content', function (req, res) {
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
        
        "sectTitle": sect.section_title,
        "section": section,   // section in the request
        "sectList": [],
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
        resData.sectList.push({
          "section": sectionList[i].section_id,
          "sectTitle": sectionList[i].section_title
        });
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
          "sectTitle": resData.sectList[prevSectNum].sectTitle
        }
      }
      if (nextSectNum < resData.sectList.length) {
        resData.next = {
          "section": chptNum + '.' + nextSectNum,
          'sectTitle': resData.sectList[nextSectNum].sectTitle
        }
      }
      
      db.close();
      res.send(JSON.stringify(resData));
      res.end();
    })
  })
}) 

/* Get catalogs */
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

/* Get or update the ranking */
router.get('/api/ranking', function (req, res) {
  var resData = {};
  var params = {
    "count": (req.query.count && parseInt(req.query.count)) || 5,
    "username": req.query.username || null,
    "score": (req.query.score == "0" && 0) || (req.query.score && parseInt(req.query.score)) || null
  }
  
  
  MongoClient.connect(url, function (err, db) {
    if (err) {
      resData = {
        "errcode": 1,
        "errmsg": "Cann't connected the data server!"
      }
      res.send(JSON.stringify(resData));
      res.end();
    }
    
    // update and get
    if (params.username && params.score) {
      insertRanking(db, params, function (err) {
        if (err) {
          db.close();
          errHandle(res, "Insert data failed!");
        }
        
        findRanking(db, function (rankers) {
          db.close();
          findRankingHandle(res, params, rankers);
        })
      })
    }
    
    // get
    else {
      findRanking(db, function (rankers) {
        db.close();
        findRankingHandle(res, params, rankers);
      })
    }
  })
})

/* Get homepage */
router.get('/api/homepageitems', function (req, res) {
  var resData = {};
  var count = req.query.count == '0' && 0 || req.query.count || 9  // default is 9
  var coverUrl = 'imgs/covers/';
  console.log(count);
  MongoClient.connect(url, function (err, db) {
    if (err) {
      db.close();
      errHandle(res, "Get failed!");
    }
    
    findHomepage(db, function (err, homepageArry) {
      if (err) {
        db.close();
        errHandle(res, "Get failed!");
      }
      
      // response data
      resData = {
        "count": Math.min(count, homepageArry.length),
        "items": []
      }
      // out-of-order the homepageArry
      homepageArry.sort(function () { return Math.random() > 0.5 ? -1 : 1});
      
      for (let i = 0; i < Math.min(count, homepageArry.length); ++i) {
        var item = {
          "section": homepageArry[i].section_id,
          "sectTitle": homepageArry[i].section_title,
          "sectTitle_en": homepageArry[i].section_title_en,
          "cover_url": coverUrl + homepageArry[i].cover,
          "brif": homepageArry[i].brif
        }
        resData.items.push(item);
      }
      
      db.close();
      res.send(JSON.stringify(resData));
      res.end();
    })
  })
})

/* Post the file */
router.post('/api/uploadfile', function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "./public";
  
  form.parse(req, function (err, fields, files) {
    var dir = '../www/public/';
    if (isVideoOrSubtitle(files.myfile.name)) dir += 'videos/';
    else dir += 'imgs/'
    
    console.log(dir + files.myfile.name);
    fs.rename(files.myfile.path, dir + files.myfile.name);
    res.end();
  })
})

function isVideoOrSubtitle(filename) {
  var suffix = ['.ogg', '.mp4', '.vtt'];
  
  for (var i = 0; i < suffix.length; ++i) {
    if (filename.indexOf(suffix[i]) > 0) {
      return true;
    }
  }
  
  return false;
}

function findRankingHandle (res, params, rankers) {
  // if err
  if (!rankers) errHandle(res, "Query error!");
  
  var resData = {
    "errcode": 0,
    "errmsg": "",
    
    "totleCount": rankers.length,
    "count": Math.min(params.count, rankers.length),
    "rankers": []
  }
  
  for (let i = 0; i < Math.min(rankers.length, params.count); ++i) {
    resData.rankers.push({
      "username": rankers[i].username,
      "score": rankers[i].score
    });
  }
  
  res.send(JSON.stringify(resData));
  res.end();
}

function errHandle(res, errmsg) {
  resData = {
    "errcode": 1,
    "errmsg": errmsg
  }
  res.send(JSON.stringify(resData));
  res.end();
}

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

function insertRanking(db, params, callback) {
  db.collection('ranking').insertOne({
    "username": params.username,
    "score": params.score,
    "data": new Date().getTime()
  }, function (err, result) {
    if (err) callback(err);
    else callback(null);
  })
}

function findRanking(db, callback) {
  var rankerArry = [];
  var rankers = db.collection('ranking').find().sort({ "score": -1, "data": -1 });
  
  rankers.each(function (err, doc) {
    if (err) console.log(err);
    
    if (doc != null) {
      rankerArry.push(doc);
    }
    else {
      callback(rankerArry);
    }
  })
}

function findHomepage(db, callback) {
  var homepageArry = [];
  var homepages = db.collection('homepage').find();
  
  homepages.each(function (err, doc) {
    if (err) {
      console.log(err);
      callback(err, null);
    }
    
    if (doc != null) {
      homepageArry.push(doc);
    }
    else {
      callback(null, homepageArry);
    }
  })
}

module.exports = router;
