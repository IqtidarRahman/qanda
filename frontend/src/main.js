import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

let token = null;

const pages = ['login', 'register', 'dashboard'];
const goToPage = (newPage) => {
    for (const page of pages) {
        document.getElementById(page).style.display = 'none';
    }
    document.getElementById(newPage).style.display = 'block';
}

document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    fetch('http://localhost:5005/' + 'auth/login', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
	})
    .then((response) => {
        response.json().then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('success');
                console.log(token);
                token = data.token;
                localStorage.setItem('token', token);
                console.log(token);
                goToPage('dashboard');
            }
        });
    });
});

document.getElementById('login-register-button').addEventListener('click', () => {
    goToPage('register');
});

document.getElementById('logout-button').addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    goToPage('login');
});

const loadThreads = () => {
	fetch('http://localhost:5005' + '/threads', {
	  method: 'GET',
	  headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      }
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
				document.getElementById('threads').innerText = '';
				for (const threadId of data) {
					const threadDom = document.createElement('div');
					threadDom.innerText = threadId;
					document.getElementById('threads').appendChild(threadDom);
				}
			}
		});
	});
};


if (localStorage.getItem('token')) {
    token = localStorage.getItem('token');
    goToPage('dashboard');
} else {
    goToPage('login');
}

console.log('Let\'s go!');
console.log('Let\'s go!');