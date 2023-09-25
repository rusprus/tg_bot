
/* {
message_id: ID_СООБЩЕНИЯ,
from: {
  id: ID_ПОЛЬЗОВАТЕЛЯ,
  is_bot: false,
  first_name: ИМЯ_ПОЛЬЗОВАТЕЛЯ,
  username: НИК_ПОЛЬЗОВАТЕЛЯ,
  language_code: 'ru'
},
chat: {
  id: ID_ЧАТА,
  first_name: ИМЯ_ПОЛЬЗОВАТЕЛЯ,
  username: НИК_ПОЛЬЗОВАТЕЛЯ,
  type: 'private'
},
date: 1686255759,
text: ТЕКСТ_СООБЩЕНИЯ,
} */

const TelegramBot = require('node-telegram-bot-api');
const env = require('./env')

const token = env.token
 process.env.URL_TO_BOT = env.URL_TO_BOT
 process.env.URL_TO_IMG = env.URL_TO_IMG
 process.env.URL_TO_VIDEO = env.URL_TO_VIDEO


// process.env.API_KEY_BOT

const bot = new TelegramBot(token, {

    polling: true

});

const commands = [

    {

        command: "start",
        description: "Запуск бота"

    },
    {

        command: "ref",
        description: "Получить реферальную ссылку"

    },
    {

        command: "help",
        description: "Раздел помощи"

    },
    {

        command: "menu",
        description: "Меню"

    },

]

bot.setMyCommands(commands);

bot.on("polling_error", err => console.log(err.data.error.message));

bot.on('text', async msg => {

    console.log(msg);



})

bot.on('photo', async img => {

    console.log(img);
    await bot.downloadFile(img.photo[img.photo.length-1].file_id, './image');

})

bot.on('photo', async img => {

    try {

        const photoGroup = [];

        for(let index = 0; index < img.photo.length; index++) {

            const photoPath = await bot.downloadFile(img.photo[index].file_id, './image');

            photoGroup.push({

                type: 'photo',
                media: photoPath,
                caption: `Размер файла: ${img.photo[index].file_size} байт\nШирина: ${img.photo[index].width}\nВысота: ${img.photo[index].height}`

            })

        }

        await bot.sendMediaGroup(img.chat.id, photoGroup);

        for(let index = 0; index < photoGroup.length; index++) {

            fs.unlink(photoGroup[index].media, error => {

                if(error) {

                    console.log(error);

                }

            })

        }

    }
    catch(error) {

        console.log(error);

    }

})

bot.on("video", async video => {

    try {

        const thumbPath = await bot.downloadFile(video.video.thumbnail.file_id, './image');

        await bot.sendMediaGroup(video.chat.id, [
            
            {

                type: 'video',
                media: video.video.file_id,
                caption: `Название файла: ${video.video.file_name}\nВес файла: ${video.video.file_size} байт\nДлительность видео: ${video.video.duration} секунд\nШирина кадра в видео: ${video.video.width}\nВысота кадра в видео: ${video.video.height}`

            },
            {

                type: 'photo',
                media: thumbPath,

            }

        ]);

        fs.unlink(thumbPath, error => {

            if(error) {

                console.log(error);

            }

        })

    }
    catch(error) {

        console.log(error);

    }

})

bot.on('audio', async audio => {

    try {

        await bot.sendAudio(audio.chat.id, audio.audio.file_id, {

            caption: `Название файла: ${audio.audio.file_name}\nВес файла: ${audio.audio.file_size} байт\nДлительность аудио: ${audio.audio.duration} секунд`

        })

    }
    catch(error) {

        console.log(error);

    }

})

bot.on('voice', async voice => {

    try {

        await bot.sendAudio(voice.chat.id, voice.voice.file_id, {

            caption: `Вес файла: ${voice.voice.file_size} байт\nДлительность аудио: ${voice.voice.duration} секунд`

        })

    }
    catch(error) {

        console.log(error);

    }

})

bot.on('text', async msg => {
    try {

        if(msg.text.startsWith('/start')) {
            
            await bot.sendMessage(msg.chat.id, `Вы запустили бота!`);

            if(msg.text.length > 6) {

                const refID = msg.text.slice(7);

                await bot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с ID ${refID}`);

            }

        }
        else if(msg.text == '/ref') {

            await bot.sendMessage(msg.chat.id, `${process.env.URL_TO_BOT}?start=${msg.from.id}`);

        }
        else if(msg.text == '/help') {

            await bot.sendMessage(msg.chat.id, `Раздел помощи HTML\n\n<b>Жирный Текст</b>\n<i>Текст Курсивом</i>\n<code>Текст с Копированием</code>\n<s>Перечеркнутый текст</s>\n<u>Подчеркнутый текст</u>\n<pre language='c++'>код на c++</pre>\n<a href='t.me'>Гиперссылка</a>`, {

                parse_mode: "HTML"
        
            });
        

        }
        else if(msg.text == '/menu') {

            await bot.sendMessage(msg.chat.id, `Меню бота`, {
        
                reply_markup: {

                    keyboard: [
        
                        ['⭐️ Картинка', '⭐️ Видео'],
                        ['⭐️ Аудио', '⭐️ Голосовое сообщение'],
                        ['⭐️ Контакт', '⭐️ Геолокация'],
                        ['❌ Закрыть меню']
        
                    ],
                    resize_keyboard: true
        
                }
        
            })
        
        }
        else if(msg.text == '❌ Закрыть меню') {

            await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
        
                reply_markup: {
        
                    remove_keyboard: true
        
                }
        
            })
        
        }
        else if(msg.text == '⭐️ Картинка') {

            await bot.sendPhoto(msg.chat.id, process.env.URL_TO_IMG, {

                caption: '<b>⭐️ Картинка</b>',
                parse_mode: 'HTML'
            
            });
        
        }

        else if(msg.text == '⭐️ Видео') {

            await bot.sendVideo(msg.chat.id, "./video/laizy.mp4", {
        
                caption: '<b>⭐️ Видео</b>',
                parse_mode: 'HTML'
        
            });
        
        }
        else if(msg.text == '⭐️ Аудио') {

            await bot.sendAudio(msg.chat.id, './audio.mp3', {
        
                caption: '<b>⭐️ Аудио</b>',
                parse_mode: 'HTML'
        
            });
        
        }
        
        else if(msg.text == '⭐️ Голосовое сообщение') {

            await bot.sendVoice(msg.chat.id, './audio.mp3', {
        
                caption: '<b>⭐️ Голосовое сообщение</b>',
                parse_mode: 'HTML'
        
            });
        
        }
        
        
        else {

            await bot.sendMessage(msg.chat.id, msg.text);

        }


    } catch (error) {
        console.log(error)
    }

})