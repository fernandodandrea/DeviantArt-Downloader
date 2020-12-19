chrome.runtime.sendMessage({ message: 'ack' }, function (response) {
  //console.log('Sending register...');
  return true;
});

window.onbeforeunload = function () {
  chrome.runtime.sendMessage({ message: 'unload' }, function (response) {
    //console.log('Unload sent...');
    return true;
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    //sender.tab //false for extension
    let button = document.querySelector('[data-hook="download_button"]');
    let imageLink = button ? button.href : '';

    if (!imageLink) {
      const pButton = document.getElementsByClassName('dev-page-download');
      if (pButton.length > 0) {
        button = pButton[0];
        imageLink = button.href;
      } else {
        const pImg = document.getElementsByClassName('dev-content-full');
        if (pImg.length > 0) {
          const img = pImg[0];
          imageLink = img.src;
        } else {
          pImg = document.getElementsByClassName('dev-content-normal');
          if (pImg.length > 0) {
            const img = pImg[0];
            imageLink = img.src;
          }
        }
      }
    }

    let fileName = '';
    let imageName = '';
    let authorName = '';
    let properFileName = '';
    if (imageLink) {
      const rxGoodName = new RegExp(/[A-Za-z0-9]+_by_[A-Za-z0-9]+/);
      const rxToULine = new RegExp(/[,\s\-\.\?]+/g);
      const rxAuthorURL = new RegExp(/_by_([A-Za-z]+)-/);
      const uri = new URI(imageLink);
      fileName = '' + uri.filename();
      const meta = $('[data-hook="deviation_meta"]') ;
      imageName = meta.find('[data-hook="deviation_title"]').text().replace(rxToULine, '_');
      authorName = fileName.match(rxAuthorURL);
      if (authorName && authorName[1]) {
        authorName = authorName[1];
      } else {
        authorName = meta.find('[data-hook="user_link"]').data('username').replace(rxToULine, '_');
      }
      properFileName = fileName;
      if (!rxGoodName.test(fileName)) {
        //console.log('FAILED : ' + fileName + ';');
        properFileName = imageName.replace(/[^A-Za-z0-9]/gi, '_') + '_by_' + authorName + '.' + fileName.split('.').pop();
      } else {
        //console.log('MATCHED: ' + fileName + ';');
      }
    }

    const rxtags = {
      'category': $('span.dev-about-breadcrumb > span:last-child > a > span').text(),
      'mature': ($('span.mature-tag').text() != ''),
      'discovery': $('a.discoverytag').map(function (i, el) { return $(el).text(); }).get()
    };

    sendResponse({ 'id': request.id, 'filename': fileName, 'propername': properFileName, 'url': window.location.host, 'image': imageName, 'author': authorName, 'link': imageLink, 'tags': rxtags });
    return true;
  }
);
