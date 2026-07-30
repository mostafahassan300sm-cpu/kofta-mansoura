// service-worker.js — معادلة كوفتا (كوفتا المنصورة SAB 4)
// نسخة الكاش: زوّدها بعد أي تعديل جوهري في الكود عشان تجبر تحديث الأجهزة
const CACHE_VERSION = 'kofta-mansoura-v1';

// الملفات الأساسية اللي هتتخزن عشان التطبيق يفتح حتى من غير نت
// عدّل القائمة دي لو أسماء ملفاتك مختلفة
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// عند التثبيت: خزّن الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// عند التفعيل: امسح أي نسخ كاش قديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// استراتيجية الجلب:
// - طلبات Firebase/API: على طول من النت (عشان البيانات تفضل لحظية)
// - باقي الملفات (HTML/CSS/JS): جرّب النت الأول، ولو النت مقطوع استخدم الكاش
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isDataRequest =
    url.includes('firestore.googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('googleapis.com');

  if (isDataRequest) {
    return; // سيب الطلب يروح للشبكة عادي من غير تدخل الكاش
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
