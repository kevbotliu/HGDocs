var socket = io.connect('localhost:8000');
var cursor = 0;
var offset;
var prevBodyText = {};
var socketName = "";
var roomId = "";
var members;
var carets = {};
var keyCombo = false;
var plainPaste = false;
var savedSel = null;
var preCursor = null;
var indicatorOffset = 2;
var deleteCookie = false;
var loggedIn = false;
window.onload = function () {
    rangy.init();
};
$(document).ready(function () {

    var gameState = localStorage.getItem('newGame');

    if (document.getElementById('val').innerHTML == "") {
        if (gameState.indexOf('true') != -1) {
            socket.emit("newGame", gameState.substring(4));


        }
        else {

            socket.emit("joinGame", gameState);
        }
    }
    else {
        roomId = document.getElementById('val').innerHTML;

        socket.emit("retrieved", roomId);
    }


    document.getElementById('list').addEventListener('click', function(e)
    {
        if (e.target.tagName === 'LI'){
            $("#"+e.target.textContent.substring(2)).toggle();
        }
    });
    document.getElementById('main').onkeydown = function (event2) { //later to involve: document.getElementById("editor").addEventListener("input", function() {}, false);
        var evtobj = window.event ? event : event2;
        var savedSelTemp = rangy.getSelection().saveCharacterRanges(document.getElementById('main'));
        if (savedSelTemp && savedSelTemp != null && savedSelTemp[0] != undefined && savedSelTemp[0] != null) {
            preCursor = savedSelTemp[0].characterRange.start;
        }
        keyCombo = false;
        if (evtobj.ctrlKey && evtobj.shiftKey && evtobj.keyCode==86) {
            plainPaste = true;
        }
        else if (evtobj.ctrlKey && evtobj.keyCode==86 && !evtobj.shiftKey) {
            plainPaste = false;
        }
        else if (evtobj.ctrlKey && evtobj.keyCode==90 && !evtobj.shiftKey) {
            evtobj.preventDefault();
            var doop = $('#main').caret('pos');
            console.log(doop);
            var temp = document.getElementById('main').innerHTML;
            document.getElementById('main').innerHTML = prevBodyText;
            prevBodyText = temp;
            $('#main').caret('pos', doop);
        }
        else if (evtobj.ctrlKey && evtobj.keyCode==89 && !evtobj.shiftKey) {
            //alert("redo");
            evtobj.preventDefault();

            keyCombo = true;
        }
        else if((evtobj.ctrlKey && evtobj.keyCode==17) || (evtobj.shiftKey && evtobj.keyCode == 16) || evtobj.keyCode == 37 || evtobj.keyCode == 38 || evtobj.keyCode == 39 || evtobj.keyCode == 40)
        {
            keyCombo = true;
        }
        else
        {
            prevBodyText = document.getElementById('main').innerHTML;
        }
    };
    document.getElementById('main').onkeyup = function (e) {
        if (e.keyCode == 13) {
            //document.getElementById('main').innerHTML+='<ent></ent>';
            document.getElementById('main').innerHTML += '&nbsp';
        }




        if (!keyCombo) {
            cursor = $('#main').caret('pos');
            offset = $('#main').caret('offset');




            var data = {
                body: document.getElementById('main').innerHTML,
                roomId: roomId,
                cursor: {id: socketName, caret: offset, pos: preCursor}
            };
            socket.emit("bodyChanged", data);

        }
    };


    socket.on("getRoomCode", function (data) {
        roomId = data.roomId;
        $('title').html(roomId);
        window.history.pushState("", "", "/" + roomId);
        socketName = data.socketId;
        var contactInformation = [{
            'firstName': data.socketId,
            'lastName': "Editing",
            'color': randomColor({luminosity: 'light'})
        }];
        $("#list").append("<li class='in' style='background-color:"+contactInformation[0].color+";'>"+data.socketId+"[You]</li>");
        setCookie(roomId,0,365);
        console.log(roomId);
        var cookies = document.cookie.split(';');

        if(getCookie("loggedIn")!="")
        {

            $('#barLogIn').html('Log Out');
            $('#barSignUp').fadeOut();
            $('#dispEmail').html(getCookie('loggedIn'));
        }



        if(document.cookie.indexOf("loggedIn")!=-1)// session cookie
        {
            var email = getCookie("loggedIn");
            console.log(email);
            var data2 = {email:email,files:document.cookie};
            socket.emit("updateFiles",data2);
        }


        for(var i = 0;i<cookies.length;i++)
        {
            console.log(cookies[i].length);
            if(cookies[i].length==7 || cookies[i].length==8) //I don't know why some cookies have assignments while others don't
            {
                console.log(cookies[i]);
                if(cookies[i].charAt(0)==' ')
                {
                    cookies[i] = cookies[i].split(' ')[1];
                    console.log(cookies[i]+"rkjgkgkjgk");
                }
                var test = cookies[i].substring(0,cookies[i].length-2);
                var cla = (roomId==test) ? "current save css" : "save css";
                $("#files").append("<test id='"+ cookies[i].substring(0,cookies[i].length-2)+"' class='"+cla +"'>"+cookies[i].substring(0,cookies[i].length-2)+"<button class = 'minus' onclick=deleteCookie=true;delete_cookie('"+test+"');location.reload();><i class='fa fa-minus'></i></button></test>");

                $("#"+test).on("click", function() {


                    if(deleteCookie==false)
                    {

                        window.location.href=location.origin+"/"+this.id;
                    }
                    deleteCookie = false;


                });
            }
        }

    });
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
        window.location.reload();// look into
        $('#barLogIn').html('Log Out');
        $('#barSignUp').fadeOut();
        $('#dispEmail').html(data.email);

    });
    socket.on("updateEditors", function (data) {
        members = data.split(":");
        members.pop();

        $("#editors").empty();
        $("#list").empty();
        var contactInformation = [];
        for (var i = 0; i < members.length; i++) {
            var currentElement = members[i];
            contactInformation.push({
                'firstName': socketName == members[i] ? members[i] + "(You)" : members[i],
                'lastName': "Editing",
                'color': randomColor({luminosity: 'light'})
            });
            $("#list").append("<li class='in' style='background-color:"+contactInformation[i].color+";'>"+contactInformation[i].firstName+"</li>");
            if (_.has(carets, currentElement) == false) {
                carets[currentElement] = undefined; //default offset
                if (!$('#' + currentElement.substring(2)).length) {
                    $('body').append("<div id=" + currentElement.substring(2) + " class=" + currentElement.substring(2) + " style='position: relative; top: -1px; left: -1px;'>" + currentElement.substring(2) + "</div>"); //2 for removing /#
                    $("#" + currentElement.substring(2)).append("<div class=" + currentElement.substring(3) + "</div>");
                    $("#" + currentElement.substring(2)).css('border', '1px solid gray');
                    $("#" + currentElement.substring(2)).css('position', 'absolute');
                    $("#" + currentElement.substring(2)).css('z-index', '999');
                    $("#" + currentElement.substring(2)).css('padding', '0 3px');
                    $("#" + currentElement.substring(2)).css('border-radius', '3px');
                    $("#" + currentElement.substring(2)).toggle();
                    $("#" + currentElement.substring(2)).css('background-color', contactInformation[i].color);
                    if (currentElement == socketName) {
                        console.log(currentElement + " " + socketName);
                        $("#" + currentElement.substring(2)).remove();
                    }
                }


            }

        }
        var diff = $(Object.keys(carets)).not(members).get();

        if (diff[0] != undefined) {

            delete carets[diff[0]]; //remove individual who left
            $("#" + diff[0].substring(2)).remove();
        }
    });


    socket.on("bodyChanged", function (data) {
            //console.log("BODY CHANGED");
            var old = document.getElementById('main').innerHTML;
            var OldText = $('#main').text();

            savedSel = rangy.getSelection().saveCharacterRanges(document.getElementById('main'));
            var selectedTextLength = 0;
            if (savedSel != null && savedSel != undefined && savedSel[0] != null && savedSel[0] != undefined) {
                selectedTextLength = window.getSelection().anchorNode.length;
            }
            offset = $('#main').caret('offset');
            var test = $('#main').caret('offset');
            document.getElementById('main').innerHTML = data.body;

            var NewText = $('#main').text();

            //console.log(NewText);
            //console.log(OldText);
            var modified = OldText.length - NewText.length;


            if (savedSel && savedSel != null && savedSel[0] != undefined && savedSel[0] != null) {
                var pos = savedSel[0].characterRange.start;
                var p1 = OldText.substring(0, pos).length;
                var p2 = OldText.substring(pos).length;
                var h1 = NewText.substring(0, pos).length;
                var h2 = NewText.substring(pos).length;
                // console.log("OLD BEFORE: "+OldText.substring(0,pos));
                // console.log("NEW BEFORE: "+NewText.substring(0,pos));
                // console.log("OLD AFTER: "+OldText.substring(pos));
                // console.log("NEW AFTER: "+NewText.substring(pos));

                if (modified == 0) {
                    rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);

                    var offset2 = $('#main').caret('offset');
                    console.log(offset2);
                    console.log(test);
                    if (OldText == NewText && offset.top > offset2.top)//
                    {
                        console.log("backspaced but no char change");
                        savedSel[0].characterRange.start -= Math.abs(1);
                        savedSel[0].characterRange.end -= Math.abs(1);

                        rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);

                    }
                    else {
                        // alert("not text modified");
                        console.log("text not modified");




                        rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);

                    }

                }
                if (modified < 0 && OldText.length > 0) {
                    //  console.log(OldText.substring(0, pos));
                    //  console.log(NewText.substring(0, pos));
                    //  console.log(pos);

                    //console.log(data.cursor.pos);
                    //console.log(pos);
                    if (data.cursor.pos!=null && data.cursor.pos<pos) {

                        savedSel[0].characterRange.start += Math.abs(modified);
                        savedSel[0].characterRange.end += Math.abs(modified);
                        rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);
                        console.log("text inserted prior to caret");
                    }
                    else {
                        rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);
                        console.log("text inserted AFTER caret");
                    }


                }
                else if (modified > 0 && OldText.length > 0) {

                    //if ((OldText.substring(0, pos) != NewText.substring(0, pos))) {
                    if (data.cursor.pos!=null && data.cursor.pos<pos) {
                        savedSel[0].characterRange.start -= Math.abs(modified);
                        savedSel[0].characterRange.end -= Math.abs(modified);

                        rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);
                    }
                    else {
                        rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);
                    }
                }


                //  rangy.getSelection().restoreCharacterRanges(document.getElementById('main'), savedSel);


            }



            if (data.cursor.id == socketName) {
                $("#" + data.cursor.id.substring(2)).remove();
            }
            var offset2 = data.cursor.caret;
            //prevBodyText = data.body;
            if (offset2 != undefined) {

                $("#" + data.cursor.id.substring(2))
                    .offset({left: offset2.left, top: offset2.top + offset2.height + indicatorOffset})
                    .find("." + data.cursor.id.substring(3))
                    .html(data.cursor.id);
            }
        }

    )
    ;


});

$(window).resize(function () {//fix to be added for carets

});
function delete_cookie( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function bodyChanged() { //for font changes
    cursor = $('#main').caret('pos');
    offset = $('#main').caret('offset');


    var data = {
        body: document.getElementById('main').innerHTML,
        roomId: roomId,
        cursor: {id: socketName, caret: offset}
    };
    socket.emit("bodyChanged", data);
}

function sendCanvas(canvasOBJ)
{
    var data = {
        canvas: canvasOBJ.canvas,
        ctx: canvasOBJ.ctx,
        roomId: roomId
    };
    socket.emit("sendCanvas", data);
}
socket.on("canvasChanged", function (data) {
//canvas = data.canvas;
    //   ctx = data.ctx;
});

function accountQ(test)
{
    if(getCookie("loggedIn")!="")
    {
//figure this out later

    }
    else if($(test).html()=="Account"){ //not logged in stuff below
    showLogin("signUp");
    }
    else{
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





}
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
        $('#barSignUp').fadeIn();
        $('#dispEmail').html('');
    }
}


$('#main').on('paste', function (e) {

    if (plainPaste) {
        e.preventDefault();
        var text = (e.originalEvent || e).clipboardData.getData('text/plain');
        plainPaste = false;
        window.document.execCommand('insertText', false, text);
    }
    else {

    }
});

