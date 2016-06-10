(function ($) {
  $(document).ready(function () {
    
    requestSectionMenu();
    
    bindSubmitModified($('.submint-modified'), $('.content-area'));
    
    console.log($('#fileuploader'));
    $('#fileuploader').uploadFile({
      url: '../api/uploadfile',
      fileName: "myfile",
      allowedTypes: 'jpg,jpeg,png,gif,ogg,mp4,vtt',
      uploadStr: '上传',
      // dragDropStr: '可'
    })
  });
 
})(jQuery)

function requestSectionMenu() {
  $.ajax({
    method: 'GET',
    url: '/api/catalogs'
  })
  .done(function (data) {
    var resData = JSON.parse(data);
    
    if (resData.errcode == 1) {
      alert(resData.errmsg);
    }
    else {
      refreshChptMenu($('.chpt-menu'), $('.sect-menu'), resData.sections);
    }
  })
}

function refreshChptMenu(chptMenu, sectMenu, sections) {
  // init
  chptMenu.html("");
  
  chptMenu.append(new AOption("", ""));  // push a empty option as default
  
  for (let i = 0; i < sections.length; ++i) {
    chptMenu.append(new AOption(i, sections[i].chptTitle));
  }
  
  // bind click event
  bindChptMenuClick(chptMenu, sectMenu, sections);
}

function bindChptMenuClick(chptMenu, sectMenu, sections) {
  chptMenu.change(function () {
    var val = $(this).val();
    if (val == "") return;
    
    var chpt = parseInt(val);
    refreshSectMenu(sectMenu, sections[chpt].sectList);
  })
}

function refreshSectMenu(sectMenu, sectList) {
  // init
  sectMenu.html("");
  
  for (let i = 0; i < sectList.length; ++i) {
    sectMenu.append(new AOption(sectList[i].sectNum, sectList[i].sectTitle));
  }
  
  // bind click event
  bindSectMenuClick(sectMenu);
}

function bindSectMenuClick(sectMenu) {
  sectMenu.click(function () {
    var section = $(this).val();
    if (section == "") return;
    
    request.getContent(section, function (sect) {
      showContent(sect, $('.content-area'));
    });
  })
}

function AOption(attrValue, value) {
  var opt = $('<option></option>');
  $(opt).attr('value', attrValue);
  $(opt).html(value);
  
  return opt;
}

function showContent(sect, container) {
  // handle the err
  if (sect.errcode == 1) {
    alert(sect.errmsg);
    return;
  }
  
  container.html('');  // init
  container.attr("data-section", sect.section);  // data-section is a customer attr
  var separator = '-----';
  var content = "";
  
  for (let i = 0; i < sect.content.length; ++i) {
    content = content + sect.content[i] + '<br>' + separator + '<br>';
  }
  
  container.html(content);
  
  bindSubmitModified($('.submit-modified'), container);
}

function bindSubmitModified(btn, contentArea) {
  btn.unbind('click');  // remove all click event before
  
  btn.click(function () {
    if (contentArea.text() == "") {
      return;
    }
    
    var section = contentArea.attr('data-section');
    // filter content, first delete <br> and split by '------'
    var content = contentArea.text().replace(/\<br\>/g, "").split('-----');
    (content[content.length - 1] == "") && (--content.length);
    
    var sendData = {
      'section': section,
      'contentStr': content.join('@@')   // ajax cann't send array
    };
    // formData.append('section', section);
    // formData.append('content', content);
    
    request.modifyContent(sendData, function (resData) {
      if (resData.errcode == 1) {
        alert(resData.errmsg);
      }
      else {
        alert('修改成功！');
      }
    })
  })
}