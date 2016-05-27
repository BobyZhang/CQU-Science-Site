 var request = {
  // getContent 
  getContent: function (section, callback) {
    $.ajax({
      type: 'GET',
      url: '/api/content?section=' + section
    })
    .done(function (data){
      var resData = JSON.parse(data);
      
      callback(resData);
    })
  },
  
  modifyContent: function (postData, callback) {
    $.ajax({
      url: '/api/modify',
      type: 'POST',
      data: postData      
    })
    .done(function (data) {
      var resData = JSON.parse(data);
      
      callback(resData);
    })
  },
  
  sendRankingRequest: function(count, name, score, callback) {
    var paramStr = "";
    
    if (name && score) {
      paramStr = serialParam({
      "count": count,
        "username": name,
        "score": score
      });
    }
    else {
      paramStr = serialParam({ "count": count });
    }
     
    var url = '/api/ranking' + paramStr;
    
    $.ajax({
      type: 'GET',
      url: url,
    })
    .done(function (data) {
      var resData = JSON.parse(data);
      
      callback(resData);
    })
  },
  
  sendHomepageItemsRequest: function (count, callback) {
    count = (count == '0' && 0 || 6);  // default count is 6

    var url = '/api/homepageitems?count=' + count;
    
    $.ajax({
      type: 'GET',
      url: url
    })
    .done(function (data) {
      var resData = JSON.parse(data);
      
      callback(resData);
    })
  }
}

function serialParam(obj) {
  var str = '?';
  
  for (attr in obj) {
    str = str + attr + '=' + obj[attr] + '&';
  }
  
  // get out the last char '&'
  str = str.substr(0, str.length - 1);
  
  return str;
}