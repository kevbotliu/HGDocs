var socket = io.connect('localhost:8000');

var openDocs = [];
$(document).ready(function () {
    var cookies = document.cookie.split(';');
    //create cookie blacklist, everything that's left is a unique docId cookie
    for(var i = 0;i<cookies.length;i++)
    {
        if(cookies[i]!="log1" || cookies[i]!="placeholder1")
        {
            openDocs.push(cookies[i].split('=')[0]);
        }
    }
    console.log(openDocs);

});

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
/*$("#editDoc").hover( function(){
 $("#roomId").fadeToggle();


 });*/
$("#editDoc2").click(function(e){
    e.preventDefault();
    if(!$('#roomId').is(":visible")){$('#roomId').fadeIn();$("#roomId").focus();}
    else{
        localStorage.setItem('newGame', document.getElementById('roomId').value);location.href=document.getElementById('roomId').value;
    }
});
$("#roomId").focusout(function(){
    $('#roomId').fadeOut();
});
$("#roomId").keydown(function(e){
    if(e.keyCode==13)
    {
        localStorage.setItem('newGame', document.getElementById('roomId').value);location.href=document.getElementById('roomId').value;
    }
});
function showLogin(button)
{
    if(button=='login')
    {
        $('#submitFields').val('Log In');
        $('.login-header').html('Log In');if(!$('#logIn').is(":visible")){$('#logIn').fadeIn();}
        $('.login').mouseleave(function() {
            $('#logIn').fadeOut();
        });
    }
    else if(button=='signUp')
    {
        $('#submitFields').val('Sign Up');
        $('.login-header').html('Sign Up');if(!$('#logIn').is(":visible")){$('#logIn').fadeIn();}
        $('.login').mouseleave(function() {
            $('#logIn').fadeOut();
        });
    }
    else if(button=='logOut')
    {
        delete_cookie("loggedIn");
        $('#barLogIn').html('Log In');
    }
}
socket.on("logIn", function (data) {
    if(data=="failed")
    {
        alert("Incorrect Username or Password");
        return;
    }
    else if(data=="accountExists")
    {
        alert("Account with that email already exists");
        return;
    }
    else if(data=="accountCreated")
    {
        alert("Account Created");
        return;
    }
    setCookie("loggedIn",data.email,0);
    console.log(document.cookie);
    //localStorage.setItem("files", data.files);
    var files = data.files.split(";");
    for(var i = 0;i<files;i++)
    {
        setCookie(files[i],0,0);
    }
    $('#barLogIn').html('Log Out');

});
function accountQ()
{
    var data = {email: $('#email').val(), password: $('#password').val()};
    if( $('.login-header').html()=='Sign Up')
    {

        socket.emit("createAccount", data);
    }
    else
    {
        socket.emit("logIn", data);



    }
}

function setCookie(cname, cvalue, exdays) {
    if(exdays!="0")
    {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    else {
        document.cookie = cname + "=" + cvalue;
    }

}
function setCookieNoExpire(cname, cvalue) {
    document.cookie = cname + "=" + cvalue;
}
function delete_cookie( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}