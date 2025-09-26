import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

window.onload = function () {
    const auth = getAuth();
    const db = getFirestore();

    const friendsListEl = document.getElementById('friends-list');
    const chatMessagesEl = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatWithNameEl = document.getElementById('chat-with-name');

    let userId = null;
    let currentFriendId = null;
    let unsubscribeMessages = null;

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            alert('Будь ласка, увійдіть у свій акаунт!');
            return;
        }
        userId = user.uid;
        loadFriends();
        listenNewTasks(); // Підключаємо автоматичне дублювання завдань у чат
    });

    function loadFriends() {
        const friendsRef = collection(db, `artifacts/default-app-id/users/${userId}/friends`);
        onSnapshot(friendsRef, (snapshot) => {
            friendsListEl.innerHTML = '';
            snapshot.forEach(doc => {
                const friend = doc.data();
                const div = document.createElement('div');
                div.className = 'friend';
                div.textContent = friend.name;
                div.dataset.id = friend.userId;
                div.addEventListener('click', () => openChat(friend.userId, friend.name));
                friendsListEl.appendChild(div);
            });
        });
    }

    function openChat(friendId, friendName) {
        currentFriendId = friendId;
        chatWithNameEl.textContent = friendName;

        if (unsubscribeMessages) unsubscribeMessages();

        const messagesRef = collection(db, `artifacts/default-app-id/users/${userId}/chats/${friendId}/messages`);
        const q = query(messagesRef, orderBy('createdAt'));
        chatMessagesEl.innerHTML = '';

        unsubscribeMessages = onSnapshot(q, (snapshot) => {
            chatMessagesEl.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                const div = document.createElement('div');
                div.className = 'message ' + (msg.senderId === userId ? 'me' : 'friend');
                div.textContent = msg.text;
                chatMessagesEl.appendChild(div);
            });
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        });
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || !currentFriendId) return;

        await saveMessage(currentFriendId, text);
        chatInput.value = '';
    }

    async function saveMessage(friendId, text) {
        // Зберігаємо у свого користувача
        const messagesRef = collection(db, `artifacts/default-app-id/users/${userId}/chats/${friendId}/messages`);
        await addDoc(messagesRef, {
            senderId: userId,
            text,
            createdAt: new Date()
        });

        // Дублюємо у друга
        const friendMessagesRef = collection(db, `artifacts/default-app-id/users/${friendId}/chats/${userId}/messages`);
        await addDoc(friendMessagesRef, {
            senderId: userId,
            text,
            createdAt: new Date()
        });
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // ------------------------
    // Автододавання завдань у чат
    // ------------------------
    function listenNewTasks() {
        const tasksRef = collection(db, `artifacts/default-app-id/users/${userId}/tasks`);
        onSnapshot(tasksRef, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const task = change.doc.data();
                    const taskText = `Нове завдання: ${task.title}`;
                    
                    // Якщо є вибраний чат, додаємо одразу туди
                    if (currentFriendId) {
                        saveMessage(currentFriendId, taskText);
                    } else {
                        // Інакше дублюємо у "особистий чат" з самим собою
                        saveMessage(userId, taskText);
                    }
                }
            });
        });
    }
};