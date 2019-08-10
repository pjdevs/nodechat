document.getElementById('connect').onclick = function(event) {
    event.preventDefault();
    $.post('/login', { username: document.getElementById('username').value }, function(data, status) {
        if (status == 'success') {
            window.location.replace('/chat');
        } else {
            alert('Login didn\'t succeed');
        }
    });
}