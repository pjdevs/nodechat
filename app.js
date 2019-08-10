//Import modules
var express = require('express');
var session = require('express-session')({
    secret: 'will never find it',
    resave: true,
    saveUninitialized: true
});
var sharedSession = require('express-socket.io-session');
var http = require('http');
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var morgan = require('morgan');

//Web server
const port = 80, adress = '0.0.0.0';
var conversationData = [];
var app = express();
var server = http.createServer(app);

//Middlewares
app.set('trust proxy', 1);
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session);
app.use(morgan('common'));

//Routes
app.get('/login', (req, res) => {
    if (req.session.logged) {
        res.redirect('/chat');
    } else {
        if (req.session.username) {
            res.render('login.ejs', { username: req.session.username });
        }
        else {
            res.render('login.ejs', { username: '' });
        }
    }
})
.get('/chat', (req, res) => {
    if (req.session.logged) {
        res.render('chat.ejs', { username: req.session.username, data: conversationData });
    } else {
        res.redirect('/login');
    }
})
.get('/logout', (req, res) => {
    req.session.logged = false;
    res.redirect('/login');
})
.post('/login', (req, res) => {
    if (req.body.username != '') {
        req.session.logged = true;
        req.session.username = req.body.username;
        
        res.redirect('/chat');
    } else {
        res.redirect('/login');
    }
})
.use((req, res) => {
    if (req.session.logged) {
        res.redirect('/chat');
    } else {
        res.redirect('/login');
    }
});

//Real-time socket server

var io = socketio.listen(server);

//Middlewares
io.use(sharedSession(session, { autoSave: true }));

//Signals
io.sockets.on('connection', (socket) => {
    console.log(socket.handshake.session.username + ' now connected');

    socket.on('new_client', () => {
        var msg = socket.handshake.session.username + ' is now connected';

        socket.emit('info', msg);
        socket.broadcast.emit('info', msg);

        conversationData.push({
            type: 'info',
            message: msg 
        });
    });

    socket.on('message', (msg) => {
        //msg = ent.encode(msg);

        var data = {
            username: socket.handshake.session.username,
            message: msg
        };

        conversationData.push({
            type: 'message',
            username: socket.handshake.session.username,
            message: msg 
        });

        socket.emit('message', data);
        socket.broadcast.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log(socket.handshake.session.username + ' is disconnected');
        socket.broadcast.emit('info', socket.handshake.session.username + ' is disconnected');
    });
});

//Start server
server.listen(port, adress, () => {
    console.log('Server listenning on ' + adress + ':' + port);
});