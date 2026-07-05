import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyChtJQjMl8yAK3DYPIpnd6bw-tC44X-Wk8",
  authDomain: "clash-of-mas-2c0fc.firebaseapp.com",
  databaseURL: "https://clash-of-mas-2c0fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "clash-of-mas-2c0fc",
  storageBucket: "clash-of-mas-2c0fc.firebasestorage.app",
  messagingSenderId: "127863621457",
  appId: "1:127863621457:web:3137db5d7f9e9878b1f570"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// PWA — Установка приложения
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.classList.remove('hidden');
  console.log('Событие beforeinstallprompt сработало');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Пользователь ${outcome === 'accepted' ? 'установил' : 'отклонил'} приложение`);
  
  deferredPrompt = null;
  installBanner.classList.add('hidden');
});

window.addEventListener('appinstalled', () => {
  console.log('Приложение установлено');
  installBanner.classList.add('hidden');
  deferredPrompt = null;
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Приложение запущено в standalone режиме');
  installBanner.classList.add('hidden');
}

// Проверка подключения к Firestore
async function checkFirebaseConnection() {
  const statusElement = document.getElementById('firebase-status');
  try {
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    statusElement.textContent = '✅ Подключено к Firebase';
    statusElement.style.color = '#4caf50';
    return true;
  } catch (error) {
    statusElement.textContent = '❌ Ошибка подключения: ' + error.message;
    statusElement.style.color = '#f44336';
    return false;
  }
}

// Получение данных из Firestore
async function loadFirestoreData() {
  const dataElement = document.getElementById('firestore-data');
  try {
    const querySnapshot = await getDocs(collection(db, 'messages'));
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(`📝 ${doc.data().text || 'Пустое сообщение'}`);
    });
    
    if (messages.length > 0) {
      dataElement.innerHTML = messages.join('<br>');
    } else {
      dataElement.innerHTML = 'Нет данных. Добавьте первое сообщение через Firebase Console.';
    }
  } catch (error) {
    dataElement.innerHTML = 'Ошибка загрузки данных: ' + error.message;
    console.error('Ошибка Firestore:', error);
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker зарегистрирован:', registration.scope);
    } catch (error) {
      console.error('Ошибка регистрации Service Worker:', error);
    }
  }

  await checkFirebaseConnection();
  await loadFirestoreData();

  setInterval(loadFirestoreData, 30000);
});
