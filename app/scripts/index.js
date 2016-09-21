
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function $id(id) {
	return document.getElementById(id);
}

//
// output information
function output(msg) {
	var m = $id("messages");
	m.innerHTML = msg ;
}



// create the panel list
var panels, fileselect, filedrag, config;
const {ipcRenderer} = require('electron');

//
// change the panel
function changePanel(panelId){
    for(var panel of panels){
      console.log("panel : "+panel);
      panel.style.display = "none";
    }
    $id(panelId).style.display = "flex";
}

//
// initialize
function Init() {

    fileselect = $id("fileSelect");
		filedrag = $id("filedrag");
    panels = document.getElementsByClassName("panel");

    config = require("./../config.json");
    

    console.log("init lancé",config);

    ipcRenderer.on('asynchronous-reply', (event, msg) => {
      if(msg.panel !== undefined){
        changePanel(msg.panel);
      }
      if(msg.message !== undefined){
        output(msg.message);
      }
    })

  

  //init settings fields with actual settings
  $id("cKindleAdress").value = config.kindle ;
  $id("cUser").value = config.smtpConfig.auth.user ;
  $id("cPass").value = config.smtpConfig.auth.pass ;

  //addEventListener to button validate
  $id("bValidate").addEventListener("click", bValidateClick, false);
	
  // bSettings
  $id("bSettings").addEventListener("click", () => changePanel("settings"), false);

  // bConverter
  $id("bConverter").addEventListener("click", () => changePanel("dropable"), false);

	// file select
	fileselect.addEventListener("change", FileSelectHandler, false);
	
	// file drop
	filedrag.addEventListener("dragover", FileDragHover, false);
	filedrag.addEventListener("dragleave", FileDragHover, false);
	filedrag.addEventListener("drop", FileSelectHandler, false);

  // set opening panel
  changePanel("dropable");

}

// validate options
function bValidateClick(e){
  changePanel("wait");
  output("Sending new settings");

  var conf = {
    kindle: $id("cKindleAdress").value,
    user :  $id("cUser").value,
    pass : $id("cPass").value
  }
  ipcRenderer.send('newConf', conf);
}

//processResult from a main process action


// file drag hover
function FileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.target.className = (e.type == "dragover" ? "hover" : "");
}

// file selection
function FileSelectHandler(e) {

	// cancel event and hover styling
	FileDragHover(e);

	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

  var file = files[0];

	// launch the conversion
  console.log(file);
  changePanel("wait");
	output("sending file");
  ipcRenderer.send('fileDroped', {name:file.name, path:file.path});

}

// call initialization function
Init();