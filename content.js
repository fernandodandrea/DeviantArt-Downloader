chrome.runtime.sendMessage({message:'ack'}, function(response) {
  //console.log('Sending register...');
  return true;
});

window.onbeforeunload = function() {
  chrome.runtime.sendMessage({message:'unload'}, function(response) {
  //console.log('Unload sent...');
  return true;
});
}

chrome.runtime.onMessage.addListener (
  function (request, sender, sendResponse) {
    //sender.tab //false for extension
    var button = null;
    var imageLink = '';
    var curTab = null;
    var pButton = document.getElementsByClassName('dev-page-download');
    if(pButton.length > 0) {
      button = pButton[0];
      imageLink = button.href;
    } else {
      var pImg = document.getElementsByClassName('dev-content-full');
      if(pImg.length > 0) {
        var img = pImg[0];
        imageLink = img.src;
      } else {
        pImg = document.getElementsByClassName('dev-content-normal');
        if(pImg.length > 0) {
          var img = pImg[0];
          imageLink = img.src;
        }
      }  
    }
    var fileName = '';
    var imageName = '';
    var authorName = '';
    if (imageLink != '') {
      var rxGoodName = new RegExp (/[A-Z,a-z,0-9]+_by_[A-Z,a-z,0-9]+/);
      var rxToULine = new RegExp (/[_,\s,-]/g);
      var rxAuthorURL = new RegExp (/(?:_by_)([A-Z,a-z]+)(?:-)/); 
      var uri = new URI(imageLink);
      fileName = '' + uri.filename();
      imageName = $('.dev-title-container>h1>a').text().replace(rxToULine, '_');
      authorName = fileName.match(rxAuthorURL);
      if (authorName!=null) {
        if (authorName!=undefined)
          if (authorName.length>1)
            authorName = authorName[1];
      } else {
        authorName = $('.dev-title-container>h1>small>span>a').text().replace(rxToULine, '_');
      }
      var properFileName = fileName;
      if (!rxGoodName.test(fileName)) {
        //console.log('FAILED : ' + fileName + ';');
        properFileName = imageName.replace(/[^A-Za-z0-9]/gi, '_') + '_by_' + authorName + '.' + fileName.split('.').pop();
      } else {
        //console.log('MATCHED: ' + fileName + ';');
      }
    }
    
    var rxtags = {
      'category': $('span.dev-about-breadcrumb > span:last-child > a > span').text(),
      'mature' : ($('span.mature-tag').text()!=''),
      'discovery' : $('a.discoverytag').map(function (i, el) { return $(el).text(); }).get()
    };

    sendResponse ( {'id': request.id, 'filename' : fileName, 'propername' : properFileName, 'url': window.location.host, 'image' : imageName, 'author' : authorName, 'link': imageLink, 'tags':rxtags});
    return true;
  }
);
