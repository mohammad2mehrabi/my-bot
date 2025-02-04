const workerURL = 'workerURL';
const c = 'GROUP_CHAT_ID';
const GROUP_CHAT_ID = 'GROUP_CHAT_ID';

// لیست کاربران مجاز
const allowedUsers = ['Mamad11la', 'Mohammad_mehrabiii'];

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(req) {
  const url = new URL(req.url);

  // تنظیم Webhook
  if (url.pathname === '/webset' && req.method === 'GET') {
    return setWebhook();
  }

  // پردازش پیام‌های دریافتی از تلگرام
  if (req.method === 'POST') {
    try {
      const update = await req.json();
      if (update.message) {
        const chatId = update.message.chat.id;
        const username = update.message.from?.username || "ناشناخته";

        // اگر کاربر برای اولین بار /start ارسال کند
        if (update.message.text === "/start") {
          await sendMessage(chatId, `👋 خوش آمدید ${username}!\n\nاین بات برای ارسال عکس و ویدیو به گروه طراحی شده است.`);
          
          // بررسی مجاز بودن کاربر
          if (allowedUsers.includes(username)) {
            await sendMessage(chatId, "✅ شما مجاز به استفاده از این بات هستید.");
          } else {
            await sendMessage(chatId, "⛔ شما مجاز به استفاده از این بات نیستید.");
            return new Response('Unauthorized user', { status: 403 });
          }
          return new Response('ok');
        }

        // بررسی اینکه کاربر مجاز است یا نه
        if (!allowedUsers.includes(username)) {
          await sendMessage(chatId, "⛔ شما مجاز به استفاده از این بات نیستید.");
          return new Response('Unauthorized user', { status: 403 });
        }

        // دریافت لینک عکس از پیام متنی
        if (update.message.text) {
          const text = update.message.text;
          if (isValidImageUrl(text)) {
            const success = await sendPhotoToGroup(text);
            if (success) {
              await sendMessage(chatId, "✅ عکس شما با موفقیت به گروه ارسال شد!");
            } else {
              await sendMessage(chatId, "❌ مشکلی در ارسال عکس به گروه رخ داد!");
            }
          } else {
            await sendMessage(chatId, "❌ لینک نامعتبر است. لطفاً یک لینک معتبر به عکس ارسال کنید.");
          }
        }

        // دریافت و ارسال ویدیو
        if (update.message.video) {
          const videoFileId = update.message.video.file_id;
          const success = await sendVideoToGroup(videoFileId);
          if (success) {
            await sendMessage(chatId, "🎥 ویدیوی شما با موفقیت به گروه ارسال شد!");
          } else {
            await sendMessage(chatId, "❌ مشکلی در ارسال ویدیو به گروه رخ داد!");
          }
        }
      }
      return new Response('ok');
    } catch (error) {
      return new Response('Invalid JSON', { status: 400 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}

// تنظیم Webhook
async function setWebhook() {
  const url = `https://api.telegram.org/bot${API_KEY}/setWebhook?url=${workerURL}/webhook`;
  const response = await fetch(url);
  const data = await response.json();
  return new Response(data.ok ? 'Webhook set successfully!' : 'Failed to set webhook', { status: data.ok ? 200 : 400 });
}

// ارسال پیام به تلگرام
async function sendMessage(chat_id, text) {
  const url = `https://api.telegram.org/bot${API_KEY}/sendMessage?chat_id=${chat_id}&text=${encodeURIComponent(text)}`;
  await fetch(url);
}

// ارسال عکس به گروه تلگرام
async function sendPhotoToGroup(photoUrl) {
  const url = `https://api.telegram.org/bot${API_KEY}/sendPhoto`;
  const body = new FormData();
  body.append("chat_id", GROUP_CHAT_ID);
  body.append("photo", photoUrl);

  const response = await fetch(url, {
    method: "POST",
    body
  });

  const result = await response.json();
  return result.ok; // اگر ارسال موفق بود، true برمی‌گرداند
}

// ارسال ویدیو به گروه تلگرام
async function sendVideoToGroup(videoFileId) {
  const url = `https://api.telegram.org/bot${API_KEY}/sendVideo`;
  const body = new FormData();
  body.append("chat_id", GROUP_CHAT_ID);
  body.append("video", videoFileId);

  const response = await fetch(url, {
    method: "POST",
    body
  });

  const result = await response.json();
  return result.ok; // اگر ارسال موفق بود، true برمی‌گرداند
}

// بررسی معتبر بودن لینک عکس
function isValidImageUrl(url) {
  return /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(url);
}
