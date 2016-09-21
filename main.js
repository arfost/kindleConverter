const {app, BrowserWindow, ipcMain} = require('electron');
const convert = require("./convert.js");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600, resizable: false});
  win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/app/index.html`);

  // Open the DevTools.
  //win.webContents.openDevTools()

  
  

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var updateConfigEvent = function(event, arg){
    var config = {
      "smtpConfig" : {
          "host": "smtp.gmail.com",
          "port": 465,
          "secure": true,
          "auth": {
              "user": arg.user,
              "pass": arg.pass
          }
      },
      "kindle":arg.kindle
    }

    try{
      convert.updateConfig(config);
      event.sender.send('asynchronous-reply', {panel:'dropable', message:'new settings saved'});
    }catch(err){
      console.log(err);
      event.sender.send('asynchronous-reply', {panel:'settings', message:'Error : '+err.message});
    }
}

ipcMain.on('newConf', updateConfigEvent);

var surveyor = function(mess){
  
}

var fs = require('fs');
var postFileEvent = function(event, file){
  try{
    var fileBuffer = fs.readFileSync(file.path);
    console.log(fileBuffer);
  }catch(error){
    event.sender.send('asynchronous-reply', {panel:'dropable', message:'Error : '+error.message})
  }
  convert.doConversionAndSend(fileBuffer, file.name, (mess) => {event.sender.send('asynchronous-reply', mess)});
}

ipcMain.on('fileDroped', postFileEvent);