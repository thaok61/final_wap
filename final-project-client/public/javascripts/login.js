window.onload = function() {
    let token = localStorage.getItem("token");
    if (token !== null) {
        window.location.href = '/shop.html';
    }

    document.getElementById('submit').onclick = function(event) {
        event.preventDefault();
        login();
    }
}

async function login() {
    try {
        const response = await fetch('http://localhost:3000/login/', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
            })
        });

        if (response.ok) {
            const result = await response.json();
            const token = result.token;
            const username = result.username;

            if (token) {
                // Successful login, redirect to /shop
                localStorage.setItem("token", token);
                localStorage.setItem("username", username);
                window.location.href = '/shop.html';
            } else {
                // Handle the case where the token is null or not present
                alert('Wrong Password');
            }
        } else {
            // Handle non-OK response (e.g., server error)
            alert('Error: Server error');
        }
    } catch (error) {
        // Handle network errors or other exceptions
        console.error('An error occurred:', error);
        alert('Error: An error occurred');
    }
}



