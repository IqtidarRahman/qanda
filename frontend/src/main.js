import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

let token = null;

const pages = ['login', 'register', 'dashboard', 'new-thread-scrn'];
const goToPage = (newPage) => {
    for (const page of pages) {
        document.getElementById(page).style.display = 'none';
    }
    document.getElementById(newPage).style.display = 'block';
}

let threadCount = 0;
let currentDisplayedThread = null;
let mainThreadCreator = null;
let userId;

// 
// Milestone 1
const loadDashboard = () => {
    threadCount = 0;
    loadThreads(threadCount);
    checkMoreBtn();
    goToPage('dashboard');
}

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    fetch('http://localhost:5005' + '/auth/login', {
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
                console.log(token);
                token = data.token;
                userId = data.userId;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);
                console.log(token);
                console.log(userId);
                loadDashboard();
            }
        });
    });
});

// Register
document.getElementById('login-register-btn').addEventListener('click', () => {
    goToPage('register');
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    goToPage('login');
});

// 
// Milestone 2
document.getElementById('new-thread-create-btn').addEventListener('click', () => {
    goToPage('new-thread-scrn');
})

document.getElementById('new-thread-post-btn').addEventListener('click', () => {
    const title = document.getElementById('new-thread-title').value;
    const isPublic = document.getElementById('new-thread-public').value === 'on';
    const content = document.getElementById('new-thread-content').value;
    console.log({
        title: title,
        isPublic: isPublic,
        content: content,
    })
    fetch('http://localhost:5005' + '/thread', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({
            title: title,
            isPublic: isPublic,
            content: content,
        })
    }).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                loadDashboard();
            }
        });
    });
});


const loadThreads = (start) => {
	fetch('http://localhost:5005' + `/threads?start=${start}`, {
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
				for (const threadId of data) {
                    const threadDetails = threadConstruct(threadId);
                    if (threadDetails) {
                        document.getElementById('threads').appendChild(threadDetails);
                        clickThreadPreview(threadId);
                    } else {
                        console.log('smth fucked up with threadDetails')
                        console.log(threadDetails)
                    }
				}
			}
		});
	});
};

const checkMoreBtn = () => {
    fetch('http://localhost:5005' + `/threads?start=${threadCount + 5}`, {
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
                if (data.length == 0) {
                    document.getElementById('more-threads-btn').style.display = 'none';
                }
            }
		});
	});
}

document.getElementById('more-threads-btn').addEventListener('click', () => {
    threadCount+=5;
    loadThreads(threadCount);
    checkMoreBtn();
});

const threadConstruct = (threadId) => {
    const threadDom = document.createElement('div');
    threadDom.style.backgroundColor = 'white';

    fetch('http://localhost:5005' + `/thread?id=${threadId}`, {
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
                const threadTitle = document.createElement('h4');
                threadTitle.innerText = '😍 ' + data.title;
                threadDom.appendChild(threadTitle);
                
                const threadCreatedAt = document.createElement('p');
                threadCreatedAt.innerText = data.createdAt;
                threadDom.appendChild(threadCreatedAt);
                
                const threadCreatorId = document.createElement('p');
                threadCreatorId.innerText = data.creatorId;
                threadDom.appendChild(threadCreatorId);
                
                const threadLikes = document.createElement('p');
                threadLikes.innerText = 'Likes: ' + data.likes;
                threadDom.appendChild(threadLikes);
                
                console.log(threadDom);
			}
		});
	});
    
    threadDom.className = 'thread-preview';
    threadDom.id = threadId;
    
    return threadDom;
};


const clickThreadPreview = (threadId) => {
    currentDisplayedThread = threadId;
    const threadElement = document.getElementById(threadId);
    if (!threadElement) {
        console.error(`Thread with ID '${threadId}' not found`);
        return;
    }
    
    threadElement.addEventListener('click', () => {
        updateMainThread(threadId);
        document.getElementById('interact-container').style.display = 'block';
    });
    
}

const updateMainThread = (threadId) => {
    const threadMain = document.getElementById('thread-main');
    threadMain.innerText = "";
    checkUserCreateMainThread();

    fetch('http://localhost:5005' + `/thread?id=${threadId}`, {
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
                const threadTitle = document.createElement('h4');
                threadTitle.innerText = '🥵 ' + data.title;
                threadMain.appendChild(threadTitle);
                
                const threadContent = document.createElement('p');
                threadContent.innerText = data.content;
                threadMain.appendChild(threadContent);
                
                const threadLikes = document.createElement('p');
                threadLikes.innerText = 'Likes: ' + data.likes;
                threadMain.appendChild(threadLikes);
                
                mainThreadCreator = data.creatorId;

                console.log(threadMain);
            }
        });
    });
}

// 
// Milestone 3

const checkUserCreateMainThread = () => {
    getMainThreadUserId().then((threadUserId) => {
        // console.log(userId);
        // console.log(getMainThreadUserId());
        // const gmt = getMainThreadUserId();
        // console.log('gmt creator id: ' + gmt)
        // console.log(`i am saying ${userId}=${gmt}=${mainThreadCreator} is `,userId == getMainThreadUserId())
        if (userId == threadUserId) {
            console.log('user matches main thread');
            document.getElementById('edit-btn').style.display = 'inline';
            document.getElementById('delete-btn').style.display = 'inline';
        } else {
            console.log('user doesn\'t match main thread');
            document.getElementById('edit-btn').style.display = 'none';
            document.getElementById('delete-btn').style.display = 'none';
        }
    });
}

const getMainThreadUserId = () => {
    let threadUserId;
    return fetch('http://localhost:5005' + `/thread?id=${currentDisplayedThread}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Authorization': token,
        }
	})
    .then((response) => { 
        return response.json();
    })
    .then((data) => {
        if (data.error) {
            alert(data.error);
        } else {
            threadUserId = data.creatorId;
            console.log('threadUserId:', data.creatorId);
            console.log('data.creatorId:', data.creatorId);
            return threadUserId;
        }
    });
}

// Editing a thread
document.getElementById('edit-btn').addEventListener('click', () => {
    const editModal = document.getElementById('edit-modal');
    editModal.style.display = 'block';
});
// document.addEventListener('click', function(event) {
//     console.log('this happened');
//     if (event.target.id == 'edit-btn') {
//         console.log('this happened');
//         const editModal = document.getElementById('edit-modal');
//         console.log(editModal);
//         editModal.style.display = 'block';
//         console.log(editModal);
//     }
// });

// Close modal when user clicks the close button
document.querySelector('.close').addEventListener('click', () => {
    editModal.style.display = 'none';
});




// Save edited thread
document.getElementById('save-edit').addEventListener('click', () => {
    const updatedTitle = document.getElementById('edit-title').value;
    const updatedContent = document.getElementById('edit-content').value;
    const isPrivate = document.getElementById('edit-private').value === 'on';
    const isLocked = document.getElementById('edit-locked').value === 'on';

    console.log(updatedTitle);
    console.log(updatedContent);
    console.log(String(currentDisplayedThread));

    // Send updated data to backend using PUT request
    fetch('http://localhost:5005/thread', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({
            "id": `${currentDisplayedThread}`,
            "title": updatedTitle,
            "isPublic": !isPrivate,
            "lock": isLocked,
            "content": updatedContent,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Close modal + update main display and sidebar
        document.getElementById('edit-modal').style.display = 'none';
        updateMainThread(currentDisplayedThread);
        const existingMain = document.getElementById(currentDisplayedThread);
        const newMain = threadConstruct(currentDisplayedThread);
        existingMain.parentNode.replaceChild(newMain,existingMain);
    })
    .catch(error => console.error('Error updating thread:', error));
    console.log(1);
});


if (localStorage.getItem('token')) {
    console.log('TOKEN FOUNDDDDDDD')
    token = localStorage.getItem('token');
    userId = localStorage.getItem('userId');
    loadDashboard();
} else {
    console.log('TOKEN NOT FOUNDD')
    goToPage('login');
}

console.log('Let\'s go!');
console.log('Let\'s go!');