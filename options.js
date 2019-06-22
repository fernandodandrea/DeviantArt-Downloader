// Saves options to localStorage.
function save_options() {


  //artistfolder
  var inputbox = document.getElementById("path");
  var checkbox = document.getElementById("save-json");
  var artistfoldercheckbox = document.getElementById("artistfolder");

  var path = (inputbox.value == '') ? 'DeviantArtDownloader' : inputbox.value;
  var savejson = checkbox.checked;
  var artistfolder = artistfoldercheckbox.checked;

  localStorage["path"] = path;
  localStorage["save-json"] = savejson;
  localStorage["artistfolder"] = artistfolder;
  console.log(path);
  console.log(savejson);
  console.log(artistfolder);
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var favorite = localStorage["path"];
  if (!favorite) {
    console.log("DeviantArtDownloader: No path saved.")
  } else {
    var inputbox = document.getElementById("path");
    inputbox.value = favorite;
  }
  var savejson = localStorage["save-json"];
  if (!savejson) {
    console.log("DeviantArtDownloader: No option set.")
  } else {
    var checkbox = document.getElementById("save-json");
    checkbox.checked = savejson == 'true';
  }

  //artistfolder
  var artistfolder = localStorage["artistfolder"];
  if (!artistfolder) {
    console.log("DeviantArtDownloader: No artistfolder option set.")
  } else {
    var artistfoldercheckbox = document.getElementById("artistfolder");
    artistfoldercheckbox.checked = artistfolder == 'true';
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
