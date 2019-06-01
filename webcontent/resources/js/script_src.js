// Container for frontend application
var app = {};
// Session data container
if(!sessionStorage.mysession){
    app.session = {
      'tokenid' : '',
      'page' : '',    
      'user' : {}    
    };
}else{
   app.session = JSON.parse(sessionStorage.mysession);
}

function handleFiles(elt, files) {
     console.log(JSON.stringify(elt.value));
    console.log(files);
  for (var i = 0; i < files.length; i++) {
      console.log(JSON.stringify(files[i]));
    const file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    //const img = document.createElement("img");
    //img.classList.add("obj");
    //img.file = file;
    //preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
    
    const reader = new FileReader();
    reader.onload = function (e) {
                             console.log(file.fileName);
    };
    reader.readAsDataURL(file);
      app.actions.upload(file);
  }
}









app.session.loadpage = function(){
    app.session.tokenid = app.session.tokenid.trim().length > 0 ? app.session.tokenid.trim() : false;
    app.session.page = app.session.page.trim().length > 0 ? app.session.page.trim() : 'index';
    if(app.session.tokenid && app.session.page){
        if(app.session.user.name !=undefined && app.session.user.name.trim().length > 0){
           app.client.memuloggedin();
            app.client.cartmanipulation();
           if(app.session.page === 'index'){
               delete app.session.menus;
               delete app.session.user.orders;
               app.client.memuloggedinindex2();               
           }
           if(app.session.page === 'menus'){
              //console.log(app.session.menus);
              delete app.session.user.orders;
                var html='';
              for(var i=0; i  < app.session.menus.list.length; i++){
                  html+='<div class="itemlistname">'+app.session.menus.list[i].pizza.replace("'","\'")+'</div><div class="itemlistqty">$'+app.session.menus.list[i].price+'</div><div class="itemlistaction"><a onclick="app.client.openaddcartform(\''+app.session.menus.list[i].pizza.replace("'","\'")+'\','+app.session.menus.list[i].price+');" href="menus#addcartform">add to cart</a></div><div class="cleardiv"></div>'
              }  
               //sessionStorage.mysession = JSON.stringify(app.session);
               document.getElementById('listitems').innerHTML=html;
           }
           if(app.session.page === 'cart'){              
               delete app.session.menus;               
               delete app.session.user.orders;
               app.client.rendercart();  
               
           }
           if(app.session.page === 'profile'){              
               
               if(app.session.user.orders){
                  if(app.session.user.orders.length > 0){
                      var html='';
                      for(var i=0; i < app.session.user.orders.length; i++)
                        html+= app.session.user.orders[i]+'<br/>';
                      document.getElementById('listitems').innerHTML+='<div class="listorders">Orders pending...<br/>'+html+'</div>';
                  }     
               }
               
               document.getElementById('mailinputp').value = app.session.user.email;
               document.getElementById('pwdinputp').value = '';
               document.getElementById('nameinputp').value = app.session.user.name;
               document.getElementById('streetinputp').value = app.session.user.street;
               if(app.session.user.phone)
                    document.getElementById('phoneinputp').value = app.session.user.phone;
               if(app.session.user.cc)
                    document.getElementById('ccinputp').value = app.session.user.cc;
               
           }
        }
    }else{
       app.client.memuloggedout();
       if(app.session.page === 'index'){
              app.client.memuloggedoutindex2();               
        }
    }
};




app.client = {};

// Interface for making API calls
app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  // Set defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

   
    
  // For each query string parameter sent, add it to the path
  var requestUrl = path;
  var counter = 0;
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl+='&';
       }else{
           requestUrl+='?';
       }
       // Add the key and value
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  // If there is a current session token set, add that as a header
  if(app.session.tokenid.length>0){
    xhr.setRequestHeader("tokenid", app.session.tokenid);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;
        // Callback if requested
        if(callback){
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }
        }
      }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
};



app.client.printmessage = function(msg){
    document.getElementById('msgprinter').innerHTML=msg;
    document.getElementById('msgreturn').style.display='block';
    setInterval(function(){
        document.getElementById('msgreturn').style.display='none';
    },5000);
};

app.client.memuloggedout = function(){
    document.getElementById('menulogout').classList.add("loggedin");
    document.getElementById('menuwelcome').classList.add("loggedin");
    document.getElementById('menuregister').classList.add("loggedout");
    document.getElementById('menulogin').classList.add("loggedout");
    document.getElementById('menucart').classList.add("loggedin");
    document.getElementById('menumenus').classList.add("loggedin");
    
    document.getElementById('menulogout').classList.remove("loggedout");
    document.getElementById('menuwelcome').classList.remove("loggedout");
    document.getElementById('menuregister').classList.remove("loggedin");
    document.getElementById('menulogin').classList.remove("loggedin");
    document.getElementById('menucart').classList.remove("loggedout");
    document.getElementById('menumenus').classList.remove("loggedout");
};
app.client.memuloggedoutindex2 = function(){   
    document.getElementById('homeactionsout1').style.display='block';
    document.getElementById('homeactionsout2').style.display='block';
    document.getElementById('homeactionsin').style.display='none';
};
app.client.memuloggedin = function(){
    document.getElementById('menulogout').classList.add("loggedout");
    document.getElementById('menuwelcome').classList.add("loggedout");
    document.getElementById('menuregister').classList.add("loggedin");
    document.getElementById('menulogin').classList.add("loggedin");
    document.getElementById('menucart').classList.add("loggedout");
    document.getElementById('menumenus').classList.add("loggedout");
    
    document.getElementById('menulogout').classList.remove("loggedin");
    document.getElementById('menuwelcome').classList.remove("loggedin");
    document.getElementById('menuregister').classList.remove("loggedout");
    document.getElementById('menulogin').classList.remove("loggedout");
    document.getElementById('menucart').classList.remove("loggedin");
    document.getElementById('menumenus').classList.remove("loggedin");
     document.getElementById('menuwelcomelink').innerHTML='Welcome, '+app.session.user.name;
};
app.client.memuloggedinindex2 = function(){   
    document.getElementById('homeactionsout1').style.display='none';
    document.getElementById('homeactionsout2').style.display='none';
    document.getElementById('homeactionsin').style.display='block';
};

app.client.openaddcartform = function(pizza,price){
    document.getElementById('addcartformpizza').value = pizza;
    document.getElementById('addcartformpu').value = price;
    document.getElementById('addcartformqty').focus();
};

app.client.cartmanipulation = function(){
    var nberitems=0;
        var amount=0;
    if(app.session.user.cart){
        if(app.session.user.cart.length > 0){
            for(var i=0; i < app.session.user.cart.length; i++){
                nberitems+=app.session.user.cart[i].quantity;
                amount+=app.session.user.cart[i].amount;
            }
        }
        if(nberitems > 0){
            document.getElementById('cartitems').innerHTML = nberitems;
            document.getElementById('cartitems').style.display='block';
        }else{
            document.getElementById('cartitems').style.display='none';
        }    
    }
    return {'nberitems' : nberitems, 'amount' : amount};
};

app.client.rendercart = function(){
    var html='';
   if(app.session.user.cart.length>0){
        for(var i=0; i  < app.session.user.cart.length; i++){
              html+='<div class="itemlistname">'+app.session.user.cart[i].pizza.replace("'","\'")+'</div><div class="itemlistqty">$'+app.session.user.cart[i].amount+'</div><div class="itemlistqty"><input value="'+app.session.user.cart[i].quantity+'" type="text" onkeyup="app.client.updatecart(\''+app.session.user.cart[i].pizza.replace("'","\'")+'\',this.value);"/></div><div class="itemlistaction"><a onclick="app.actions.removecart(\''+app.session.user.cart[i].pizza.replace("'","\'")+'\');" >remove</a></div><div class="cleardiv"></div>'
          }  
       
        
       
           //sessionStorage.mysession = JSON.stringify(app.session);
           document.getElementById('listitems').innerHTML=html;
           document.getElementById('listitemscheckout').innerHTML='<div class="itemlistname">Total amount</div><div class="itemlistaction">$'+app.client.cartmanipulation().amount+'</div><div class="itemlistaction"><a onclick="app.actions.makeorder();" class="actionbotton">Make order</a></div><div class="cleardiv"></div>';
   }else{
       document.getElementById('listitems').innerHTML='';
       document.getElementById('listitemscheckout').innerHTML='';
   }
};
               






















// AJAX Client (for RESTful API)
// all the actions done by the internaute
app.actions={};
app.actions.gotohome = function(){
   app.session.page='index'; 
   sessionStorage.mysession = JSON.stringify(app.session); 
   window.location = 'index';    
};


app.actions.upload = function(file){   
    
    var formData = new FormData();
    console.log(file);
    formData.append("file", file);
    for (var p of formData) {
      console.log(p);
    }
    var xhr = new XMLHttpRequest();
   
    xhr.open("POST", "/upload");
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    
    xhr.send(formData);
     xhr.onload = function(){
        console.log('yeffff');
    }; 
    
};

app.actions.register = function(){
    var userlogin=document.getElementById('mailinput').value;
    var userpwd=document.getElementById('pwdinput').value;
    var username=document.getElementById('nameinput').value;
    var userstreet=document.getElementById('streetinput').value;
    var userphone=document.getElementById('phoneinput').value;
    var usercc=document.getElementById('ccinput').value;
    var userpp=document.getElementById('ppinput').value;
    
   userlogin = userlogin.trim().length > 0 ? userlogin : false;
    userpwd = userpwd.trim().length > 0 ? userpwd : false;    
    username = username.trim().length > 0 ? username : false;
    userstreet = userstreet.trim().length > 0 ? userstreet : false;
    userphone = userphone.trim().length > 0 ? userphone : false;
    usercc = usercc.trim().length > 0 ? usercc : false;
    userpp = userpp.trim().length > 0 ? userpp : false;
    
    if(userlogin && userpwd && username && userstreet){
        var payload ={
            'email' : userlogin, 
            'password' : userpwd,
            'name' : username,
            'street' : userstreet,
            'apimethod' : "register"
        }
        if(userphone)
            payload.phone=userphone;
        if(usercc)
            payload.cc=usercc;
        if(userpp)
            payload.pp = userpp;
            
        console.log(payload.pp.name);
        console.log(document.getElementById('ppinput').files.length);
        app.client.request(undefined,'api/rest','post',undefined,payload,function(status,response){
            if(status == 200){
                document.getElementById('mailinput').value = '';
                document.getElementById('pwdinput').value = '';
                document.getElementById('nameinput').value = '';
                document.getElementById('streetinput').value = '';
                document.getElementById('phoneinput').value = '';
                document.getElementById('ccinput').value = '';
                document.getElementById('ppinput').value = '';
                app.client.printmessage(response.message);   
                //window.location='index';
            }else{
              app.client.printmessage(response.Error);  
            }
        });
    }else{
      app.client.printmessage('Fill all the fields');  
    }
};
app.actions.login = function(){
    var userlogin=document.getElementById('logininput').value;
    var userpwd=document.getElementById('passwordinput').value;
   userlogin = userlogin.trim().length > 0 ? userlogin : false;
    userpwd = userpwd.trim().length > 0 ? userpwd : false;
    if(userlogin && userpwd){
        
        var payload ={
            'email' : userlogin, 
            'password' : userpwd, 
            'apimethod' : "login"
        }
        app.client.request(undefined,'api/rest','post',undefined,payload,function(status,response){
            if(status == 200){
                var queryStringObject = {
                  'email' : userlogin, 
                  'apimethod':"getuser"
                };
                app.session.tokenid = response.tokenid;
                app.client.request(undefined,'api/rest','get',queryStringObject,undefined,function(status,response){
                    if(status == 200){
                        app.session.user = response; 
                        
                        sessionStorage.mysession = JSON.stringify(app.session);
                        window.location='index';
                        //document.getElementById('menuwelcomelink').innerHTML='Welcome, '+response.name;
                        //app.client.memuloggedin();
                    }else{
                        app.client.printmessage(response.tokenid);         
                    }    
                });        
            }else{
              app.client.printmessage(response.Error);  
            }
        });
        
        
    }else{
      app.client.printmessage('Fill all the fields');  
    }
};

app.actions.logout = function(){
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    if(userlogin){
        var queryStringObject = {
                  'email' : userlogin, 
                  'apimethod':"logout"
                };
        app.client.request(undefined,'api/rest','get',queryStringObject,undefined,function(status,response){
            if(status == 200){
                app.session.user = {};
                app.session.tokenid = '';
                app.session.page = '';
                delete app.session.menus;
                sessionStorage.mysession = JSON.stringify(app.session);
                window.location='index';
            }else{
                //sessionStorage.removeItem('mysession');
                app.session = {
                  'tokenid' : '',
                  'page' : '',    
                  'user' : {}    
                };
                sessionStorage.mysession = JSON.stringify(app.session);
                app.client.printmessage(response.Error);  
                window.location='index';// à faire si deconnecté
            }
        });
        
        
    }else{
      app.client.printmessage('No user connected');  
    }
};
app.actions.getmenus = function(){
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    if(userlogin){
        var queryStringObject = {
                  'email' : userlogin, 
                  'apimethod':"getmenus"
                };
        app.client.request(undefined,'api/rest','get',queryStringObject,undefined,function(status,response){
            
            if(status == 200){
                app.session.page = 'menus';
                 app.session.menus =response;
                
                sessionStorage.mysession = JSON.stringify(app.session);
                window.location='menus';
            }else{
              app.client.printmessage(response.Error);  
            }
        });
        
        
    }else{
      app.client.printmessage('No user connected');  
    }
};
app.actions.getcart = function(){
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    if(userlogin){
        var queryStringObject = {
                  'email' : userlogin, 
                  'apimethod':"getusercart"
                };
        app.client.request(undefined,'api/rest','get',queryStringObject,undefined,function(status,response){
            
            if(status == 200){
                app.session.page = 'cart';
                 app.session.user.cart =response;
                
                sessionStorage.mysession = JSON.stringify(app.session);
                window.location='cart';
            }else{
              app.client.printmessage(response.Error);  
            }
        });
        
        
    }else{
      app.client.printmessage('No user connected');  
    }
};
app.actions.getprofile = function(){
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    if(userlogin){
        var queryStringObject = {
                  'email' : userlogin, 
                  'apimethod':"getuserfull"
                };
        app.client.request(undefined,'api/rest','get',queryStringObject,undefined,function(status,response){
            
            if(status == 200){
                app.session.page = 'profile';
                 app.session.user =response;
                sessionStorage.mysession = JSON.stringify(app.session);
                window.location='profile';
            }else{
              app.client.printmessage(response.Error);  
            }
        });
        
        
    }else{
      app.client.printmessage('No user connected');  
    }
};
app.actions.addcart = function(){
    document.getElementById('loadingaction').style.display='block';
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    var pizza = document.getElementById('addcartformpizza').value;
    var quantity = parseInt(document.getElementById('addcartformqty').value); 
    pizza = pizza.length > 0 ? pizza : false;
    quantity = quantity > 0 ? quantity : 1;
    if(pizza && quantity &&  userlogin){
            var payload = {
                'email' : userlogin, 
                'pizza': pizza, 
                'quantity': quantity, 
                'apimethod': "addcart"
            }
           app.client.request(undefined,'api/rest','put',undefined,payload,function(status,response){
                if(status == 200){
                    app.session.user.cart =response;
                    app.client.cartmanipulation();
                    sessionStorage.mysession = JSON.stringify(app.session);
                    document.getElementById('loadingaction').style.display='none';
                }else{
                 document.getElementById('loadingaction').style.display='none';    
                  app.client.printmessage(response.Error);  
                }
            });
    }else{
        document.getElementById('loadingaction').style.display='none';
        app.client.printmessage('Dam!!');
    }
};
app.client.updatecart = function(pizza, quantity){
    document.getElementById('loadingaction').style.display='block';
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    pizza = pizza.length > 0 ? pizza : false;
    quantity = parseInt(quantity) > 0 ? parseInt(quantity) : 1;
    if(pizza && quantity &&  userlogin){
            var payload = {
                'email' : userlogin, 
                'pizza': pizza, 
                'quantity': quantity, 
                'apimethod': "addcart"
            }
           app.client.request(undefined,'api/rest','put',undefined,payload,function(status,response){
                if(status == 200){
                    app.session.user.cart =response;
                    app.client.rendercart();
                    app.client.cartmanipulation();
                    sessionStorage.mysession = JSON.stringify(app.session);
                    document.getElementById('loadingaction').style.display='none';
                }else{
                    app.client.rendercart();
                    app.client.cartmanipulation();    
                    document.getElementById('loadingaction').style.display='none';
                  app.client.printmessage(response.Error);  
                }
            });
    }else{
        document.getElementById('loadingaction').style.display='none';
        app.client.printmessage('Dam!!');
    }
};
app.actions.removecart = function(pizza){
    document.getElementById('loadingaction').style.display='block';
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    pizza = pizza.length > 0 ? pizza : false;
    if(pizza && userlogin){
            var payload = {
                'email' : userlogin, 
                'pizza': pizza, 
                'apimethod': "removecart"
            }
           app.client.request(undefined,'api/rest','put',undefined,payload,function(status,response){
                if(status == 200){
                    app.session.user.cart =response;
                    app.client.rendercart();
                    app.client.cartmanipulation();
                    sessionStorage.mysession = JSON.stringify(app.session);
                    document.getElementById('loadingaction').style.display='none';
                }else{
                  document.getElementById('loadingaction').style.display='none';    
                  app.client.printmessage(response.Error);  
                }
            });
    }else{
        document.getElementById('loadingaction').style.display='none';
        app.client.printmessage('Dam!!');
    }
};
app.actions.makeorder = function(){
    document.getElementById('loadingaction').style.display='block';
    var userlogin = app.session.user.email.trim().length > 0 ? app.session.user.email.trim() : false;
    if(userlogin){
        console.log(userlogin);
            var payload = {
                'email' : userlogin,
                'apimethod': "makeorder"
            }
           app.client.request(undefined,'api/rest','put',undefined,payload,function(status,response){
                if(status == 200 || status == 500){
                    app.session.user.cart =[];
                    app.client.rendercart();
                    app.client.cartmanipulation();
                    sessionStorage.mysession = JSON.stringify(app.session);
                    document.getElementById('loadingaction').style.display='none';
                    if(status == 200)
                        app.client.printmessage(response.message);
                    else
                        app.client.printmessage(response.Error);
                }else{
                  app.client.printmessage(response.Error);  
                }
            });
    }else{
        document.getElementById('loadingaction').style.display='none';
        app.client.printmessage('Dam!!');
    }
};
app.actions.updateuser = function(){
    var userlogin=document.getElementById('mailinputp').value;
    var userpwd=document.getElementById('pwdinputp').value;
    var username=document.getElementById('nameinputp').value;
    var userstreet=document.getElementById('streetinputp').value;
    var userphone=document.getElementById('phoneinputp').value;
    var usercc=document.getElementById('ccinputp').value;
    
   userlogin = userlogin.trim().length > 0 ? userlogin : false;
    userpwd = userpwd.trim().length > 0 ? userpwd : false;    
    username = username.trim().length > 0 ? username : false;
    userstreet = userstreet.trim().length > 0 ? userstreet : false;
    userphone = userphone.trim().length > 0 ? userphone : false;
    usercc = usercc.trim().length > 0 ? usercc : false;
    if(userlogin && (userpwd || username || userstreet)){
        var payload ={
            'email' : userlogin, 
            'password' : userpwd,
            'name' : username,
            'street' : userstreet,
            'apimethod' : "updateuser"
        }
        if(userphone)
            payload.phone=userphone;
        if(usercc)
            payload.cc=usercc;
        app.client.request(undefined,'api/rest','put',undefined,payload,function(status,response){
            if(status == 200){
               
               app.client.printmessage(response.message); 
            }else{
              app.client.printmessage(response.Error);  
            }
        });
    }else{
      app.client.printmessage('Fill all the fields');  
    }
};

app.actions.clearloginform = function(){
    document.getElementById('logininput').value='';
    document.getElementById('passwordinput').value='';
}
app.actions.clearregisterform = function(){
    document.getElementById('mailinput').value='';
    document.getElementById('pwdinput').value='';
    document.getElementById('nameinput').value='';
    document.getElementById('streetinput').value='';
    document.getElementById('phoneinput').value='';
    document.getElementById('ccinput').value='';
}

app.session.loadpage();