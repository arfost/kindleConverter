var nodemailer = require("nodemailer");
var kindlegen = require("kindlegen");



// create reusable transporter object using the default SMTP transport
var transporter;
var configuration;

var updateConfig = function(config){
  if(config === undefined){
    configuration = require("./config.json");
  }else{
    var fs = require('fs');
    fs.writeFileSync("./config.json", JSON.stringify(config));
    configuration = config;
  }
  transporter = nodemailer.createTransport(configuration.smtpConfig);
}

updateConfig();

// setup e-mail data with unicode symbols

var doConversionAndSend = function(file, fileName, surveyor){

  kindlegen(file, (error, mobi) => {
      // mobi is an instance of Buffer with the compiled mobi file
      if(error){
        surveyor({panel:"dropable", message:"Error during conversion : " + error.message});
        return console.log(error);
      }

      var mailOptions = {
          from: '"Kindle converter" <sender>', // sender address
          to: configuration.kindle, // list of receivers
          subject: 'fichier', // Subject line
          text: 'Hello world', // plaintext body
          html: '<b>Hello world</b>', // html body
          attachments: [{   // binary buffer as an attachment
            filename: fileName.replace(/\.[^/.]+$/, "")+'.mobi',
            content: mobi
          }]
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          surveyor({panel:"dropable", message:"Error sending : " + error.message});
          return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        surveyor({panel:"dropable", message:"File correctly transmitted"});
      });

  });
}

module.exports.doConversionAndSend = doConversionAndSend;
module.exports.updateConfig = updateConfig;
