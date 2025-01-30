from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackContext

# توکن ربات تلگرام شما
TOKEN = "7623096246:AAEePLWUOYccjaeXxr5ZP7DIuIYG9-nCzTU"

# تابع برای ارسال پیام خوش‌آمدگویی
async def start(update: Update, context: CallbackContext) -> None:
    user_name = update.message.chat.first_name
    welcome_message = f"سلام {user_name}! خوش آمدید به ربات تلگرام ما."
    await update.message.reply_text(welcome_message)

def main():
    # ایجاد اپلیکیشن جدید
    application = Application.builder().token(TOKEN).build()

    # اضافه کردن handler برای دستور /start
    application.add_handler(CommandHandler("start", start))

    # شروع ربات
    application.run_polling()

if __name__ == '__main__':
    main()
