var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var server = require("http").Server(app);
var io = require("socket.io")(server);
var bodyParser = require('body-parser');
var fs = require('fs');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'welcome12',
    database: 'doctest'
});
connection.connect();

server.listen(8000);

var users = require('./routes/users');


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //for simple stuff like direct url about.html, etc.

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/:tokenstring', function (request, response, next) {
    var roomCode = request.originalUrl.substring(1);
    if (roomCode == 'createDoc') {
        response.render('doc', {val: ""});
        return;
    }


    var test = connection.query('select body from documents where BINARY roomCode = ?', roomCode, function (err, result) {
        console.log(err+"<-errors");
        console.log(test.sql);
        if (result[0] != undefined) {


            response.render('doc', {val: roomCode});

        }
        else {
            console.log("here----404");
            if (roomCode == 'createDoc') {
                response.render('doc', {val: ""});
            }
            else {
                response.render('404', {val: roomCode});
            }
        }
    });
});


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
io.on("connection", function (socket) {


    socket.on("newGame", function (data) {
        var roomId = makeId();

        var document = {
            body: " <h1>TITLE</h1> <p>TextBody</p>",
            members: 1,
            roomCode: roomId
        };
        var newDocument = connection.query('insert into documents set ?', document, function (err, result) {
            if (err) {
                console.error(err + "test");

            }
            //console.error(result);
        });
        var docOwner = socket.id.substring(0, 8) + ":";
        socket.nickname = docOwner;
        connection.query("update documents set members = '" + docOwner + "' where roomCode =" + "'" + roomId + "'", 0, function (err2, result2) {

        });
        console.log(roomId);
        socket.join(roomId);
        socket.roomId = roomId;
        socket.emit('getRoomCode', {roomId: roomId, socketId: socket.id.substring(0, 8)});

        console.log("Created new Document");
    });


    socket.on("bodyChanged", function (data) {
        //data.body = data.body.replace('<script>',""); //temporary basic xss protection
        //data.body = data.body.replace('</script>',"");
        var test = connection.query("update documents set body = ? where roomCode =" + "'" + data.roomId + "'", data.body, function (err, result) {
            //console.log(test.sql);
            if (err) {
                console.log(err+"<-errors");
                console.log(test.sql);
            }

            io.to(data.roomId).emit("bodyChanged", data);
        });


    });

    socket.on("joinGame", function (data) {
        connection.query('select body from documents where roomCode=' + "'" + data + "'", 0, function (err, result) {
            console.log(err+"<-errors");
            socket.join(data);
            console.log(data);
            socket.roomId = data;
            var fix = {roomId: data};
            socket.emit('getRoomCode', fix);
            socket.emit("bodyChanged", result[0].body);

            socket.nickname = socket.id.substring(0, 8) + ":";
            var sockets = Object.keys(io.sockets.sockets);
            var queryString = "";
            console.log(sockets+"<-sockets");
            for (var key in sockets) {
                queryString += sockets[key].substring(0, 8) + ":";
            }


            connection.query("update documents set members = " + "'" + queryString + "' where roomCode =" + "'" + data + "'", 0, function (err2, result2) {
                connection.query('select members from documents where roomCode=' + "'" + data + "'", 0, function (err3, result3) {
                    io.to(data).emit("updateEditors", result3[0].members);
                });

            });


        });
    });
    socket.on("retrieved", function (roomCode) {


        socket.join(roomCode);
        socket.roomId = roomCode;
        socket.emit('getRoomCode', {roomId: roomCode, socketId: socket.id.substring(0, 8)});
        connection.query('select body from documents where roomCode=' + "'" + roomCode + "'", 0, function (err, result) {
            var data = {body: result[0].body, cursor: {id: socket.id.substring(0, 8), caret: null}};
            socket.emit("bodyChanged", data);

            socket.nickname = socket.id.substring(0, 8) + ":";
            var sockets = Object.keys(io.sockets.sockets);
            var queryString = "";
            console.log(sockets+"<-sockets");
            for (var key in sockets) {
                queryString += sockets[key].substring(0, 8) + ":";
            }


            connection.query("update documents set members = " + "'" + queryString + "' where roomCode =" + "'" + roomCode + "'", 0, function (err2, result2) {
                connection.query('select members from documents where roomCode=' + "'" + roomCode + "'", 0, function (err3, result3) {
                    io.to(roomCode).emit("updateEditors", result3[0].members);
                });

            });
        });

    });


    socket.on("createAccount", function (data) {
        var test = connection.query('select name from accounts where BINARY name = ?', data.email, function (err, result) {
            console.log(err+"<-errors");
            console.log(test.sql);
            if (result[0] == undefined) {
                var account = {
                    name: data.email,
                    password: data.password
                };
                var newAccount = connection.query('insert into accounts set ?', account, function (err, result) {
                    if (err) {
                        console.error(err + "<-errors");

                    }
                    //console.error(result);
                    socket.emit("logIn", "accountCreated");
                });



            }
            else{
                console.log("error account with that email already exists");
                socket.emit("logIn", "accountExists");
            }
        });



    });

    socket.on("logIn", function (data) {
        var test = connection.query("select files from accounts where BINARY name = ? AND password ='"+data.password+"'", data.email, function (err, result) {
            if (result[0] != undefined) {
            console.log("Logged In");
                var accountInfo = {files: result[0].files, email:data.email};
                socket.emit("logIn", accountInfo);
            }
            else {
                socket.emit("logIn", "failed");
            }
        });
    });
    socket.on("updateFiles", function (data) {
        var test = connection.query("update accounts set files = ? where name ='"+data.email+"'", data.files, function (err, result) {

        });
    });

    socket.on("sendCanvas", function (data) {
    //send the canvas to db
        io.to(data.roomId).emit("canvasChanged", data);
    });


    socket.on("disconnect", function () {
        console.log("a client has disconnected: " + socket.id);
        console.log(io.sockets.adapter.sids[socket.id]+":OK");
        var newSocket = socket.id.substring(0, 8) + ":";
        socket.nickname = newSocket;
        var sockets = Object.keys(io.sockets.sockets);
        var queryString = "";
        console.log(sockets + "sockets");
        if (socket.roomId !== undefined) {
            for (var key in sockets) {
                queryString += sockets[key].substring(0, 8) + ":";
            }


            connection.query("update documents set members = " + "'" + queryString + "' where roomCode =" + "'" + socket.roomId + "'", 0, function (err2, result2) {
                connection.query('select members from documents where roomCode=' + "'" + socket.roomId + "'", 0, function (err3, result3) {
                    io.to(socket.roomId).emit("updateEditors", result3[0].members);
                });

            });
        }

    });


});


function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = app;
