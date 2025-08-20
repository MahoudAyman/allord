const CACHE_NAME = 'lord-moving-v1';
const urlsToCache = [
  '',
  'index.html',
  'manifest.json',
  '1755348973586.jpg',
  'Img3.jpg',
  'Img4.png',
  'Img5.jpg',
  'Img6.png',
  'dark.jpg',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// تثبيت Service Worker وتخزين الملفات المؤقت
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('فتح المخزن المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker وتنظيف المخزن القديم
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف المخزن القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع الملف من المخزن المؤقت إذا وُجد
        if (response) {
          return response;
        }

        // إذا لم يوجد، جلب الملف من الشبكة
        return fetch(event.request).then(function(response) {
          // التحقق من صحة الاستجابة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // نسخ الاستجابة لتخزينها
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          // في حالة الخطأ، محاولة إرجاع صفحة احتياطية
          console.log('خطأ في جلب:', event.request.url, error);
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          // للصور، إرجاع صورة احتياطية
          if (event.request.destination === 'image') {
            return caches.match('/android-chrome-192x192.png');
          }
        });
      })
  );
});

// التعامل مع رسائل العميل
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إشعارات الدفع (اختياري)
self.addEventListener('push', function(event) {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'عرض التفاصيل',
          icon: '/favicon-16x16.png'
        },
        {
          action: 'close',
          title: 'إغلاق',
          icon: '/favicon-16x16.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('شركة اللورد لنقل العفش', options)
    );
  }
});

// التعامل مع النقر على الإشعارات
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('https://www.allorde.kesug.com/')
    );
  } else {
    event.waitUntil(
      clients.openWindow('https://www.allorde.kesug.com/')
    );
  }
});
