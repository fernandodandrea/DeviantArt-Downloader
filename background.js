Array.prototype.remove = function(value) {
  if (this.indexOf(value)!==-1) {
    this.splice(this.indexOf(value), 1);
    return true;
  } else {
    return false;
  };
} 

Array.prototype.removeDuplicates = function() {
  var temp=new Array();
  this.sort();
  for(i=0;i<this.length;i++){
    if(this[i]==this[i+1]) {continue}
    temp[temp.length]=this[i];
  }
  return temp;
}

var dd_regTabs = new Array();
var dd_path = localStorage["path"];
var dd_savejson = localStorage["save-json"] == 'true';
var dd_artistfolder = localStorage["artistfolder"] == 'true';
if (dd_path == undefined) { dd_path = 'DeviantArtDownloader'; }
if (dd_path == '') { dd_path = 'DeviantArtDownloader'; }
if (!dd_savejson) dd_savejson = false;
if (!dd_artistfolder) dd_artistfolder = false;

function cleanupRegTabs() {
  dd_regTabs = dd_regTabs.removeDuplicates();
}

chrome.runtime.onMessage.addListener (
  function(request, sender, sendResponse) {
    if (request.message == 'ack') {
      dd_regTabs.push(sender.tab.id);
      chrome.pageAction.show(sender.tab.id);  
      //sendResponse ({message: 'ack'});
      //console.log('ack received');
      return false;
    }
    if (request.message == 'unload') {
      chrome.pageAction.hide(sender.tab.id);  
      if (chrome.extension.lastError) {
        console.log('Error: ' + chrome.runtime.lastError.message);
      }
      dd_regTabs.remove(sender.tab.id);
      //console.log('unload received');
      return false;
    }
    
  }
);

function DoListener(tab) {
  if (dd_regTabs.length > 0) {

    for (var i = 0; i < dd_regTabs.length; i++) {
      var j = dd_regTabs[i];
      chrome.tabs.sendMessage(j, { 'id': dd_regTabs[i] }, function (response) {
        if (response === undefined) {
          alert('Tab ' + j + ' didn\'t answer.');
          dd_regTabs.remove(j);
          chrome.tabs.reload(j);
        } else {
          if ((response.propername != '') && (response.propername != undefined)) {
            //console.log(response.propername);
            var f_author = '';
            if (dd_artistfolder == true) f_author = '/' + response.author;
            var f_name = dd_path + f_author + '/' + response.propername;
            chrome.downloads.download({
              url: response.link,
              filename: f_name,
              conflictAction: 'overwrite'
            },
              function (downloadId) {

                if (downloadId == undefined) {
                  if (chrome.extension.lastError) {
                    console.log('Download failed, reason: ' + chrome.runtime.lastError.message);
                  } else {
                    console.log('***UNKNOWN ERROR***');
                  }
                  console.log(response);
                  return false;
                } else {
                  console.log('Download ' + downloadId + ' successfully to ' + f_name + ';');
                  if (dd_savejson==true) {
                    chrome.downloads.download({
                      url: 'data:application/json,' + JSON.stringify(response.tags),
                      filename: f_name + '.json',
                      conflictAction: 'overwrite'
                    }, function (downloadId) { console.log('JSON: saved.'); });
                  } else {
                    console.log('JSON: -----.');
                  }
                  chrome.tabs.remove(response.id);
                  dd_regTabs.remove(response.id);
                  return true;
                }
              });
          } else {
            console.log('Tab ' + j + ' didn\'t had an image.');
            //dd_regTabs.remove(j);
            cleanupRegTabs();
          }
        }
        return true;
      });
    }
    cleanupRegTabs();
  } else {
    alert('There are no Deviant Art tabs to consume.');
  }
  return true;
}

chrome.pageAction.onClicked.addListener(DoListener);

var dd_MenuIds = chrome.contextMenus.create(
    {
      'title': "DeviantArt download",
      'contexts': ["page","selection","link","editable","image"],
      'onclick': function (info, tab) { DoListener(tab);}
    }
  );

/*
chrome.tabs.query({}, function(tabs) {
    
  for (var i = 0; i < tabs.length; i++) {
    console.log(tabs[i].title);
    chrome.tabs.sendMessage(tabs[i].id, {'id': tabs[i].id}, function(response) {
        if (response===undefined) {
          console.log("No answer.");
        } else {
          console.log(response.id + ": " + responde.url);
          chrome.pageAction.show(tabs[i].id);
        }
    });
  }
});
//*/