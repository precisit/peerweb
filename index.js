var dragDrop = require('drag-drop/buffer')
var WebTorrent = require('webtorrent')
var es = require("event-stream")

var client = new WebTorrent()

var magnetUri = window.location.hash.split('#')[1];

if(magnetUri) {
  client.add(magnetUri, function (torrent) {
    // Got torrent metadata!
    console.log('Torrent info hash:', torrent.infoHash)
    var contentBlobs = {};
    var htmlFiles = {};
    var cssFiles = {};

    var filesProcessedCounter = 0;

    var processFiles = function() {
      if(torrent.files.length == filesProcessedCounter) {
        console.log('All file blobs processed, ready to transmute content files');
        var indexCount = 0;

        for(var fileName in htmlFiles){
          var blob = htmlFiles[fileName];

          if(fileName == 'index.html' || fileName == 'index.htm') {
            indexCount = 1;
            var reader = new FileReader();
            reader.readAsText(blob);

            reader.onload = function(e) {
              var filtered_content = e.target.result;
              global.target = e.target.result;

              for(var k in contentBlobs){
                console.info('WILL REPLACE', 'src="'+k+'"','src="'+contentBlobs[k]+'"');
                filtered_content = filtered_content.replace('src="'+k+'"','src="'+contentBlobs[k]+'"');
              }
              for(var k in cssFiles) {
                console.info('WILL REPLACE', 'href="'+k+'"','href="'+cssFiles[k]+'"');
                filtered_content = filtered_content.replace('href="'+k+'"','href="'+global.URL.createObjectURL(cssFiles[k])+'"');
              }
              for(var k in htmlFiles) {
                console.info('WILL REPLACE', 'href="'+k+'"','href="'+htmlFiles[k]+'"');
                filtered_content = filtered_content.replace('href="'+k+'"','href="'+global.URL.createObjectURL(htmlFiles[k])+'"');
              }
              console.log('AFTER', filtered_content);
              global.targetAfter = filtered_content;

              var doc = document.open();
              doc.write(filtered_content);
              doc.close();            
            }
          }
        }

        if(indexCount == 0) {
          for(var fileName in contentBlobs){
            // Add a link to the page
            var a = document.createElement('a')
            a.download = fileName
            a.href = contentBlobs[fileName];
            a.textContent = 'Download ' + fileName
            document.body.appendChild(a)
          }
        }
      }
    }

    torrent.files.forEach(function (file) {
      console.log('HERE IS DIE FILE!!');
      console.log(file);
      window.thefile = file;

      var fileExtension = file.name.split('.').pop();

      switch(fileExtension) {
        case 'htm':
        case 'html': //Filter HTML for src= and href= links
          //Filter for search !! 
          console.log('FOUND HTML!');
          file.getBlob(function (err, blob) {
            if (err) throw err

            htmlFiles[file.name] = blob;
            filesProcessedCounter++;
            processFiles();
          });
          processFiles();
          break;
        case 'css': //Filter CSS for links to blobbify
          console.log('FOUND CSS!');
          file.getBlob(function (err, blob) {
            if (err) throw err

            cssFiles[file.name] = blob;
            filesProcessedCounter++;
            processFiles();
          });
          break;
        default:
          console.log('FOUND DEFAULT CONTENT!');
          //Just get blob and blob URL and add to list of blob URL's
          file.getBlobURL(function (err, url) {
            if (err) throw err

            contentBlobs[file.name] = url;
            filesProcessedCounter++;
            processFiles();
          });
      }
    });
  });
}
else {
  document.getElementById('info').innerHTML += "<b>Drop your file(s) here and share it peer-2-peer.</b><br><br>If bundle contains index.html, it will be redered as a webpage (with images, stylesheets and javascript)<br>Folders not yet supported, keep everything at a 'root'-level.<br>Complex MVC frameworks, such as AngularJS, somewhat supported.";
  document.getElementById('example').innerHTML = "<i>Example:</i><br><img src='example.png'>"

  // When user drops files on the browser, create a new torrent and start seeding it!
  dragDrop('body', function (files) {
    client.seed(files, function onTorrent (torrent) {
      // Client is seeding the file!
      var url = window.location + '#' + torrent.infoHash;
      document.getElementById('example').innerHTML = "";
      document.getElementById('link').innerHTML += "<br>Share link: <a href='" + url + "'>"+url+"</a>";
    })
  })  
}
