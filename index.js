require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const express = require('express');
const startScheduler = require('./scheduler');

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ BOT_TOKEN no definido en .env");
  process.exit(1);
}

// Puerto que Railway asigna automáticamente
const PORT = process.env.PORT || 3000;
const URL = process.env.RAILWAY_STATIC_URL || `https://tu-app.up.railway.app`; // Cambia si quieres usar otra URL

// Inicializar bot en modo webhook
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

// Inicializar Express
const app = express();
app.use(express.json());

// Endpoint para recibir updates
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ---------------------------
// 📌 COMANDO /start
// ---------------------------
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
    `👋 ¡Hola, Fer!

Soy un bot ideado para ayudarte a que te prepares para el día de tu cumpleaños...

Próximamente recibirás información de mi parte 😉 `
  );

  saveChatId(chatId);
});

// ---------------------------
// 💾 Guardar usuarios
// ---------------------------
function saveChatId(chatId) {
  let chats = [];
  if (fs.existsSync('chats.json')) {
    chats = JSON.parse(fs.readFileSync('chats.json'));
  }

  if (!chats.includes(chatId)) {
    chats.push(chatId);
    fs.writeFileSync('chats.json', JSON.stringify(chats, null, 2));
  }
}

// ---------------------------
// 🎯 Escuchar respuestas
// ---------------------------
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;
  if (text.startsWith('/')) return;
  if (!fs.existsSync('state.json')) return;

  const state = JSON.parse(fs.readFileSync('state.json'));
  if (!state[chatId]) return;

  const respuesta = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // =========================
  // 🗝️ ENIGMA 1
  // =========================
  if (state[chatId] === "esperando_enigma_1") {
    const respuestasValidas = ["alboraya","alboraia"];
    if (respuestasValidas.includes(respuesta.replace(/\s/g,''))) {
      bot.sendMessage(chatId,
        `🎉 ¡CORRECTO! 🎉

Has descubierto el lugar donde comenzará tu sorpresa 📍✨`
      );
      state[chatId] = "enigma_1_superado";
      fs.writeFileSync('state.json', JSON.stringify(state, null, 2));
    } else {
      bot.sendMessage(chatId, "🤔 Mmm... esa no es la respuesta correcta.");
    }
    return;
  }

  // =========================
  // 🧳 ENIGMA 2
  // =========================
  if (state[chatId] === "esperando_enigma_2") {
    const palabrasCorrectas = [
      "abrigo","bolsa aseo","bufanda","calzoncillos","chanclas","gorra",
      "sudadera","termica","banador","botas","calcetines","camisetas",
      "chaqueta","guantes","telescopio","zapatillas"
    ];

    if (!state.progreso) state.progreso = {};
    if (!state.progreso[chatId]) state.progreso[chatId] = [];

    if (palabrasCorrectas.includes(respuesta)) {
      if (!state.progreso[chatId].includes(respuesta)) {
        state.progreso[chatId].push(respuesta);
        const encontradas = state.progreso[chatId].length;
        const restantes = 16 - encontradas;
        if (restantes > 0) {
          bot.sendMessage(chatId,
            `✅ ¡Correcto!

Has encontrado ${encontradas}/16 objetos 🧳
Te quedan ${restantes}.`
          );
        }
        if (encontradas === 16) {
          bot.sendMessage(chatId,
            `🎉 ¡ESPECTACULAR! 🎉

La maleta está lista 🧳✨`
          );
          state[chatId] = "enigma_2_superado";
        }
      } else {
        bot.sendMessage(chatId, "😜 Esa ya la habías encontrado.");
      }
    } else {
      bot.sendMessage(chatId, "❌ Esa palabra no está en la maleta...");
    }
    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));
  }

  // =========================
  // ⏳ ENIGMA 3
  // =========================
  if (state[chatId] === "esperando_enigma_3") {
    const respuestaNormalizada = respuesta.replace(/\s/g,'');
    const respuestasValidas = ["miercoles25-18:00","miercoles25-1800"];
    if (respuestasValidas.includes(respuestaNormalizada)) {
      bot.sendMessage(chatId,
        `🎉🎉🎉

Has descifrado el momento exacto.

📍 En el cartel de Alboraia.
🗓 Miércoles 25 de febrero.
🕕 18:00 (hora española).

La cuenta atrás termina ahí...

Prepárate 😏`
      );
      state[chatId] = "juego_completado";
    } else {
      bot.sendMessage(chatId,
        `⏳ No es el momento exacto...

Revisa los números.
Revisa el día.
Revisa la hora.

El tiempo es clave.`
      );
    }
    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));
    return;
  }

  // =========================
  // 📊 ENCUESTA FINAL
  // =========================
  if (state[chatId] === "encuesta_previa") {
    let resp = respuesta.toLowerCase().trim();
    let mensaje = "";

    if (resp.includes("listo")) mensaje = "🎉 ¡Genial! Todo preparado para empezar a celebrar tu cumpleaños 😎";
    else if (resp.includes("muy nervioso")) mensaje = "⚠️ No te preocupes, no hay porqué alarmarse!!!!...";
    else if (resp.includes("nada preparado")) mensaje = "😅 Bueno, aún tienes tiempo, ¡date prisa en hacer la maleta, jeje!";
    else if (resp.includes("no estoy seguro")) mensaje = "🤔 Tranquilo, repasa la maleta y relájate. Todo va a ir bien :)";
    else mensaje = "🤷‍♂️ No entiendo tu respuesta, pero confío en que todo esté bien 😏";

    bot.sendMessage(chatId, mensaje);

    state[chatId] = "encuesta_respondida";
    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));
    return;
  }

});

// ---------------------------
// 🚀 Iniciar Scheduler
// ---------------------------
startScheduler(bot);

// ---------------------------
// 🚀 Express escucha puerto
// ---------------------------
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en ${PORT}`));