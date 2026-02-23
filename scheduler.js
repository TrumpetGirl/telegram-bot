const cron = require('node-cron');
const fs = require('fs');

function startScheduler(bot) {

  // 🗓 23 febrero 22:00
  cron.schedule('37 21 23 2 *', () => {

    console.log("⏰ Enviando mensaje inicial...");

    if (!fs.existsSync('chats.json')) return;

    const chats = JSON.parse(fs.readFileSync('chats.json'));

    chats.forEach(chatId => {
      bot.sendMessage(
        chatId,
        `✨ Ahora sí, ha llegado el momento ✨

    Es hora de empezar a preparar el día más especial del año...😎

    Si quieres estar listo, deberás descifrar una serie de enigmas 🧩 

    ¿Quién sabe cuándo puede llegar el próximo mensaje?`
      );
    });

  }, {
    timezone: "Europe/Madrid"
  });

  // 🗓 23 febrero 22:15
  cron.schedule('15 22 23 2 *', () => {

    console.log("🧩 Enviando primera pista...");

    if (!fs.existsSync('chats.json')) return;

    const chats = JSON.parse(fs.readFileSync('chats.json'));

    let state = {};
    if (fs.existsSync('state.json')) {
      state = JSON.parse(fs.readFileSync('state.json'));
    }

    chats.forEach(chatId => {

      bot.sendMessage(
        chatId,
        `🗝️ PRIMER ENIGMA 🗝️

    ¿Qué pone aquí?:

    39°29'48.1"N 0°21'12.6"W`
      );

      // Marcar usuario como esperando respuesta
      state[chatId] = "esperando_enigma_1";
    });

    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));

  }, {
    timezone: "Europe/Madrid"
  });

  // 🗓 24 febrero 10:00
  cron.schedule('00 10 24 2 *', () => {

    console.log("🧩 Enviando segunda pista...");

    if (!fs.existsSync('chats.json')) return;

    const chats = JSON.parse(fs.readFileSync('chats.json'));

    let state = {};
    if (fs.existsSync('state.json')) {
      state = JSON.parse(fs.readFileSync('state.json'));
    }

    chats.forEach(chatId => {

      bot.sendPhoto(
        chatId,
        fs.createReadStream('./assets/crucigrama.png'),
        {
          caption: `🗝️ SEGUNDO ENIGMA 🗝️

    Parece ser que necesitas estar preparado para algo, así que necesitarás una maleta 🧳

    ¿Puedes encontrar las 16 cosas que debes llevar en tu viaje?

    (Aunque si quieres, puedes añadir algo más por tu cuenta jeje 😏)
    Ves escribiendo las palabras que encuentres.`
        }
      );

      // Marcar usuario como esperando respuesta
      state[chatId] = "esperando_enigma_2";
    });

    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));

  }, {
    timezone: "Europe/Madrid"
  });

  // 🗓 24 febrero 17:00 - TERCER ENIGMA
  cron.schedule('00 17 24 2 *', () => {

    console.log("🕵️ Enviando tercer enigma...");

    if (!fs.existsSync('chats.json')) return;

    const chats = JSON.parse(fs.readFileSync('chats.json'));

    // Cargar o inicializar state
    let state = {};
    if (fs.existsSync('state.json')) {
      try {
        const data = fs.readFileSync('state.json', 'utf8');
        state = data ? JSON.parse(data) : {};
      } catch (error) {
        console.log("⚠️ state.json corrupto. Reiniciando estado.");
        state = {};
      }
    }

    chats.forEach(chatId => {

      bot.sendMessage(
        chatId,
        `🗝️ TERCER ENIGMA 🗝️

  Ya sabes el lugar.
  Ya tienes la maleta preparada.

  Pero aún falta algo importante...

  📆 El día tiene 7 nombres.
  El cuarto es el correcto.

  🗓 El mes es el mismo que te ha acompañado desde el principio.

  🔢 El número del día es la suma de:
  16 (cosas en tu maleta)
  +
  9 (letras del lugar donde todo comienza)

  🕰 Cuando el reloj marque la mayoría de edad en formato 24 horas...

  Allí y entonces deberás estar.

  Para comprobar que lo has pillado, escríbeme:
  DÍA DE LA SEMANA Y NÚMERO - HORA (formato 24h)`
      );

      // Marcar usuario como esperando respuesta
      state[chatId] = "esperando_enigma_3";
    });

    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));

  }, {
    timezone: "Europe/Madrid"
  });

  // 🗓 25 febrero 12:00 - Último mensaje con opciones
  cron.schedule('00 12 25 2 *', () => {

    console.log("📣 Enviando mensaje de opciones...");

    if (!fs.existsSync('chats.json')) return;

    const chats = JSON.parse(fs.readFileSync('chats.json'));

    let state = {};
    if (fs.existsSync('state.json')) {
      try {
        const data = fs.readFileSync('state.json', 'utf8');
        state = data ? JSON.parse(data) : {};
      } catch {
        console.log("⚠️ state.json corrupto. Reiniciando estado.");
        state = {};
      }
    }

    chats.forEach(chatId => {

      // Enviar mensaje con teclado inline
      bot.sendMessage(chatId,
        `🌞 ¡Buenos días!  
  ¿Qué tal has dormido? ¿Estás preparado para el día de hoy? 😁`, 
        {
          reply_markup: {
            keyboard: [
              ["✅ Listo"],
              ["MUY NERVIOSO"],
              ["❌ Nada preparado"],
              ["🤔 No estoy seguro"]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      );

      // Marcar estado para este enigma
      state[chatId] = "encuesta_previa";
    });

    fs.writeFileSync('state.json', JSON.stringify(state, null, 2));

  }, {
    timezone: "Europe/Madrid"
  });

  console.log("📅 Mensajes programados correctamente.");
}

module.exports = startScheduler;