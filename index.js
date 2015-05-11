var dragDrop = require('drag-drop/buffer')
var WebTorrent = require('webtorrent')

var client = new WebTorrent()

var magnetUri = window.location.hash.split('#')[1];

if(magnetUri) {
  client.add(magnetUri, function (torrent) {
    // Got torrent metadata!
    console.log('Torrent info hash:', torrent.infoHash)

    torrent.files.forEach(function (file) {
      // Get a url for each file
      file.getBlobURL(function (err, url) {
        if (err) throw err

        // Add a link to the page
        var a = document.createElement('a')
        a.download = file.name
        a.href = url
        a.textContent = 'Download ' + file.name
        document.body.appendChild(a)
      })
    })
  })  
}
else {
  document.getElementById('info').innerHTML += "Drag stuff here for awesome";

  // When user drops files on the browser, create a new torrent and start seeding it!
  dragDrop('body', function (files) {
    client.seed(files, function onTorrent (torrent) {
      // Client is seeding the file!
      var url = window.location + '#' + torrent.infoHash;
      document.getElementById('link').innerHTML += "Access with URL: <a href='" + url + "'>"+url+"</a>";
    })
  })  
}
