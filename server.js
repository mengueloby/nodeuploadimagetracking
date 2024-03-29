/*
 * Server-related tasks
 *
 */

 // Dependencies
 var http = require('http');
 var https = require('https');
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;
 var config = require('./config');
 var fs = require('fs');
 var handlers = require('./handlers');
 var router = require('./router');
 var utils = require('./utils');
 var path = require('path');
 var util = require('util');
 var debug = util.debuglog('server');


// Instantiate the server module object
var server = {};

 // Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });
/*
 // Instantiate the HTTPS server
server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 };
 server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
   server.unifiedServer(req,res);
 });
*/
 // All the server logic for both the http and https server
server.unifiedServer = function(req,res){
    
   // Parse the url
   var parsedUrl = url.parse(req.url, true);

   // Get the path
   var path = parsedUrl.pathname;
   var trimmedPath = path.replace(/^\/+|\/+$/g, '');
   
    if(trimmedPath == 'upload'){
        console.log('jjjjjjjjjj');
        
        /*console.log(req.myFile);
        //req.on('end', function(){
            if(req.myFile){ // this test is not validate
            console.log('hhhhhhhhhhhhhh'); 
            //write the files on disc
        }
        res.end('good');    
        //});
        
        */
        var decoder = new StringDecoder('utf-8');
           //var buffer = [];
        var buffer = '';
           req.on('data', function(data) {
               //buffer.push(data);
               //buffer+=data;
               buffer += decoder.write(data);
           });
        req.on('end', function() {

               //var buf = Buffer.concat(buffer);
            //const data = JSON.parse(buffer);
            buffer += decoder.end();
            //console.log(data);
             //console.log(typeof data);
            //fs.createWriteStream('test.jpg').write(buffer);
            
           
            fs.writeFile("test.txt", buffer,  "binary" ,function(err) {
                if(err) {
                    res.end(err);
                } else {
                    res.end("The file was saved!");
                }
            });
            
            
               
                
            
        });
        
        
        
        
    }else{
        // Get the query string as an object
           var queryStringObject = parsedUrl.query;

           // Get the HTTP method
           var method = req.method.toLowerCase();

           //Get the headers as an object
           var headers = req.headers;

           // Get the payload,if any
           var decoder = new StringDecoder('utf-8');
           var buffer = '';
           req.on('data', function(data) {
               buffer += decoder.write(data);
           });
           req.on('end', function() {

               buffer += decoder.end();

               if(buffer.pp)
                console.log(buffer.pp.name);

               // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
               var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

               // If the request is within the public directory use to the public handler instead
               chosenHandler = trimmedPath.indexOf('webcontent/resources/') > -1 ? router.public : chosenHandler;

               // Construct the data object to send to the handler
               var data = {
                 'trimmedPath' : trimmedPath,
                 'queryStringObject' : queryStringObject,
                 'method' : method,
                 'headers' : headers,
                 'payload' : utils.parseJsonToObject(buffer)
               };

               // Route the request to the handler specified in the router
               chosenHandler(data,function(statusCode,payload,contentType){

                 // Determine the type of response (fallback to JSON)
                 contentType = typeof(contentType) == 'string' ? contentType : 'json';

                 // Use the status code returned from the handler, or set the default status code to 200
                 statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

                 // Return the response parts that are content-type specific
                 var payloadString = '';
                 if(contentType == 'json'){
                   res.setHeader('Content-Type', 'application/json');
                   payload = typeof(payload) == 'object'? payload : {};
                   payloadString = JSON.stringify(payload);
                 }

                 if(contentType == 'html'){
                   res.setHeader('Content-Type', 'text/html');
                   payloadString = typeof(payload) == 'string'? payload : '';
                 }

                 if(contentType == 'favicon'){
                   res.setHeader('Content-Type', 'image/x-icon');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }

                 if(contentType == 'plain'){
                   res.setHeader('Content-Type', 'text/plain');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }

                 if(contentType == 'css'){
                   res.setHeader('Content-Type', 'text/css');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }

                 if(contentType == 'png'){
                   res.setHeader('Content-Type', 'image/png');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }

                 if(contentType == 'jpg'){
                   res.setHeader('Content-Type', 'image/jpeg');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }
                 if(contentType == 'gif'){
                   res.setHeader('Content-Type', 'image/gif');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }   

                 if(contentType == 'font'){
                   res.setHeader('Content-Type', 'font/ttf');
                   payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 }   


                 // Return the response-parts common to all content-types
                 res.writeHead(statusCode);
                 res.end(payloadString);

                 // If the response is 200, print green, otherwise print red
                 if(statusCode == 200){
                   debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
                 } else {
                   debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
                 }
               });
           });     
    }

   
 };


 // Define the request router
server.router = {
   '' : router.index,
   'index' : router.index, 
   'menus' : router.menus,
   'cart' : router.cart,
    'profile' : router.profile,
    'public' : router.public,
    
   'api' : handlers.api, // get the methods list of the api
   'api/help' : handlers.help, // get informations about a method
   'api/rest' : handlers.rest, // execute a method
    
    
    'upload' : router.upload
 };

 // Init script
server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function(){
    console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
  });
/*
  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort,function(){
    console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
  });*/
};


 // Export the module
 module.exports = server;
