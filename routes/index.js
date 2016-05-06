var express = require('express');
var router = express.Router();
var fs = require('fs');

// read the ebook first
var ebookString = fs.readFileSync('ebook.json');
var ebook = JSON.parse(ebookString);
console.log('Read ebook success!');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET content*/
router.get('/content', function (req, res) {
  var sect = req.query.section;
  var chptString = sect.split('.');
  var chpt = [];
  
  for (var i = 0; i < chptString.length; ++i) chpt.push(parseInt(chptString[i]));
  
  if (chpt.length != 2 || chpt[0] >= ebook.length 
      || chpt[1] >= ebook[chpt[0]].chapter_content.length) {
    res.write('404, NOT FOUND!');
    res.end();
    return;
  }
  
  var resData = {};
  var sectList = [];
  for (var i = 0; i < ebook[chpt[0]].chapter_content.length; ++i) {
    sectList.push(ebook[chpt[0]].chapter_content[i].section_title);
  }
  
  // the data
  resData.sectList = sectList;
  resData.content = ebook[chpt[0]].chapter_content[chpt[1]].section_content;
  resData.currChpt = chpt;
  
  res.send(JSON.stringify(resData));
  res.end();
}) 

module.exports = router;
