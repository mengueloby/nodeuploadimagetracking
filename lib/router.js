/*
 * Request Handlers
 *
 */

// Dependencies
var utils = require('./utils');
var config = require('./config');

// Define all the handlers
var handler = {};



// Index
handler.index = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Uptime Monitoring - Made Simple',
      'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know'
    };
    // Read in a template as a string
    utils.getTemplate('index',false,templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        utils.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Menus
handler.menus = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Liste of menus',
      'head.description' : 'list of menus'
    };
    // Read in a template as a string
    utils.getTemplate('menus',false,templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        utils.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};


// Cart
handler.cart = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Your cart details',
      'head.description' : 'Cart details'
    };
    // Read in a template as a string
    utils.getTemplate('cart',false,templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        utils.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
             
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Profile
handler.profile = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Your profile',
      'head.description' : 'Your profile'
    };
    // Read in a template as a string
    utils.getTemplate('profile',false,templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        utils.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
             
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};




// Favicon
handler.favicon = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Read in the favicon's data
    utils.getStaticAsset('favicon.ico',function(err,data){
      if(!err && data){
        // Callback the data
        callback(200,data,'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets
handler.public = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Get the filename being requested
    var trimmedAssetName = data.trimmedPath.replace('webcontent/resources/css','').replace('webcontent/resources/js','').replace('webcontent/resources/images','').replace('webcontent/resources/fonts','').trim();
    if(trimmedAssetName.length > 0){
      // Read in the asset's data
      utils.getStaticAsset(trimmedAssetName,function(err,data){
        if(!err && data){

          // Determine the content type (default to plain text)
          var contentType = 'plain';

          if(trimmedAssetName.indexOf('.css') > -1){
            contentType = 'css';
          }

          if(trimmedAssetName.indexOf('.png') > -1){
            contentType = 'png';
          }

          if(trimmedAssetName.indexOf('.jpg') > -1){
            contentType = 'jpg';
          }
          if(trimmedAssetName.indexOf('.gif') > -1){
            contentType = 'gif';
          }    

          if(trimmedAssetName.indexOf('.ico') > -1){
            contentType = 'favicon';
          }
          if(trimmedAssetName.indexOf('.ttf') > -1){
            contentType = 'font';
          }    
          // Callback the data
          callback(200,data,contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }

  } else {
    callback(405);
  }
};

// Export the handlers
module.exports = handler;