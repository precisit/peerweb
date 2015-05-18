var dragDrop = require('drag-drop/buffer')
var WebTorrent = require('webtorrent')

var client = new WebTorrent()

var magnetUri = window.location.hash.split('#')[1];

if(magnetUri) {
  client.add(magnetUri, function (torrent) {
    // Got torrent metadata!
    console.log('Torrent info hash:', torrent.infoHash)

    torrent.files.forEach(function (file) {
      console.log('HERE IS DIE FILE!!');
      console.log(file);
      window.thefile = file;

      // Get a url for each file
      file.getBlob(function (err, blob) {
        if (err) throw err

        if(file.name == 'index.html' || file.name == 'index.htm') {
          var reader = new FileReader();
          reader.readAsText(blob);

          reader.onload = function(e) {
            var doc = document.open();
            doc.write(e.target.result);
            doc.close();            
          }
        }

        // Add a link to the page
        /*var a = document.createElement('a')
        a.download = file.name
        a.href = url
        a.textContent = 'Download ' + file.name
        document.body.appendChild(a)*/
      })
    })
  })  
}
else {
  document.getElementById('info').innerHTML += "Drop your file here and share it peer-2-peer.";

  // When user drops files on the browser, create a new torrent and start seeding it!
  dragDrop('body', function (files) {
    client.seed(files, function onTorrent (torrent) {
      // Client is seeding the file!
      var url = window.location + '#' + torrent.infoHash;
      document.getElementById('link').innerHTML += "Share file with link: <a href='" + url + "'>"+url+"</a>";
    })
  })  
}
