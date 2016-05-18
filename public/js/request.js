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
    console.log('post ');
    $.ajax({
      url: '/api/modify',
      type: 'POST',
      data: postData      
    })
    .done(function (data) {
      var resData = JSON.parse(data);
      
      callback(resData);
    })
  }
}