//IO
var socket = io.connect('/');
var render = $('#render-block');

function addMessage(html) {
    $('<p>' + html + '</p>')
        .hide()
        .appendTo(render)
        .fadeIn(1000, 'swing');
    render.animate({ scrollTop: render[0].scrollHeight }, 1500);
}

socket.on('info', (msg) => {
    addMessage('<i>' + msg + '</i>');
});

socket.on('message', (data) => {
    addMessage('<b><mark>' + data.username + '</mark></b>: ' + data.message);    
});

//Document
var message = document.getElementById('message');
var send = document.getElementById('send');

function sendMessage(event) {
    if (event.type == 'keyup' && event.key != 'Enter') {
       return;
    }

    if (message.value == '') {
        return;
    }
    
    socket.emit('message', message.value);
    message.value = '';
    message.focus();
}

send.onclick = sendMessage;
message.onkeyup = sendMessage;

//Start
socket.emit('new_client');