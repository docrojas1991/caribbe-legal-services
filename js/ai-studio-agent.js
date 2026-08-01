/**
 * Caribbe Legal Services - Google AI Studio Integration Engine (v1.0)
 * Connects the web application directly to Google AI Studio (Gemini 1.5 Flash API).
 */

(function () {
  const DEFAULT_SYSTEM_INSTRUCTION = `
Eres el Asistente Virtual Notarial de Inteligencia Artificial oficial de Caribbe Legal Services en Glendale, Arizona 85301.
Atiendes con empatía, profesionalismo y rapidez a clientes cubano-americanos.

DATOS OFICIALES DEL NEGOCIO Y SERVICIOS:
- Notarias Autorizadas: Lic. Alianet Roque Garcia y Lic. Yeisy Perez (Notarias Públicas con sello del Estado de Arizona "Ditat Deus", miembros de la NNA, respaldadas por Travelers Casualty and Surety Company of America).
- Ubicación: Glendale, AZ 85301, EE. UU.
- Teléfonos Directos: (480) 479-9891 / (623) 281-8606.

TRÁMITES Y PRECIOS:
1. Pasaporte Cubano:
   - Renovación y Primera Vez: $280 (Tiempo estimado: 2 meses).
2. Servicios Notariales:
   - Cartas Poder: $50
   - Declaraciones Juradas: $50
   - Certificación de Documentos: $10 por firma/cuño
   - Traducciones de Documentos: $50
   - Poder de Viaje de Menores: $450
   - Oficiante de Matrimonios Civiles: $200
3. Trámites Migratorios:
   - Permisos de Trabajo: $150
   - Residencia Permanente (Ajuste de Estatus): $400
   - Reclamación Familiar: $300
   - Ciudadanía / Naturalización: $300
4. Envíos a Cuba:
   - Aéreo Express (4 a 7 días. Salidas cada viernes. Mínimo 5 lbs):
     * Comida, Medicina y Aseo: $6.5 / lb
     * Misceláneas: $7.5 / lb
   - Marítimo (3 a 6 semanas. Mínimo 10 lbs): $3.5 / lb
   - Aéreo Aduana (15 a 20 días): $5.5 / lb
   - Remesas (Moneda Nacional, USD, MLC, Tarjeta Clásica): A partir de $50.

Responde de forma clara, directa y amable, agregando siempre la frase emocional "Cuba te espera ♡" al despedirte.
`;

  // Create AI Chat UI Element dynamically
  function injectAIChatWidget() {
    if (document.getElementById('aiStudioWidget')) return;

    const widgetHTML = `
      <div id="aiStudioWidget" class="fixed bottom-24 right-8 z-[9998] font-body">
        <!-- Floating AI Button -->
        <button id="toggleAiBtn" onclick="window.CaribbeAIStudio.toggleChat()" class="flex items-center gap-2 bg-navy text-white px-5 py-3 rounded-full shadow-2xl border-2 border-brandGold hover:scale-105 transition-all">
          <span class="material-symbols-outlined text-brandGold text-2xl animate-pulse">auto_awesome</span>
          <span class="font-headline text-xs uppercase font-extrabold tracking-wider">Asistente IA Gemini</span>
        </button>

        <!-- Chat Modal Window -->
        <div id="aiChatModal" class="hidden absolute bottom-16 right-0 w-[380px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border-2 border-navy overflow-hidden transition-all duration-300">
          <!-- Header -->
          <div class="bg-navy p-4 text-white flex justify-between items-center border-b border-brandGold/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-brandGold text-navy flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <div>
                <h4 class="font-headline text-xs font-bold uppercase text-brandGold">Asistente Notarial IA</h4>
                <p class="text-[10px] text-slate-300">Conectado con Google AI Studio (Gemini)</p>
              </div>
            </div>
            <button onclick="window.CaribbeAIStudio.toggleChat()" class="text-slate-300 hover:text-white">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- API Key Bar -->
          <div class="bg-slate-100 p-3 text-xs border-b border-slate-200 flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <span class="font-bold text-navy text-[11px]">API Key de Google AI Studio:</span>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-brandRed hover:underline font-bold text-[10px]">Obtener API Key Gratis ↗</a>
            </div>
            <input type="password" id="aiApiKeyInput" placeholder="Pega tu API Key de aistudio.google.com aquí" onchange="window.CaribbeAIStudio.setApiKey(this.value)" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"/>
          </div>

          <!-- Messages Body -->
          <div id="aiChatMessages" class="p-4 h-[300px] overflow-y-auto space-y-3 text-xs bg-slate-50">
            <div class="bg-white p-3 rounded-2xl border border-slate-200 text-slate-800 shadow-sm">
              👋 ¡Hola! Soy el asistente virtual notarial impulsado por **Google AI Studio (Gemini)**. ¿En qué trámite de pasaporte, envío a Cuba o certificación puedo ayudarte hoy?
            </div>
          </div>

          <!-- Input Bar -->
          <form onsubmit="window.CaribbeAIStudio.sendMessage(event)" class="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input type="text" id="aiUserInput" placeholder="Escribe tu consulta sobre pasaportes o notaría..." required class="flex-grow bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-navy"/>
            <button type="submit" class="bg-brandRed text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const savedKey = localStorage.getItem('caribbe_ai_studio_key');
    if (savedKey) {
      document.getElementById('aiApiKeyInput').value = savedKey;
    }
  }

  // Toggle Chat Window
  function toggleChat() {
    const modal = document.getElementById('aiChatModal');
    if (modal) modal.classList.toggle('hidden');
  }

  // Set API Key
  function setApiKey(key) {
    localStorage.setItem('caribbe_ai_studio_key', key.trim());
  }

  // Send Message to Gemini API from Google AI Studio
  async function sendMessage(e) {
    e.preventDefault();
    const inputEl = document.getElementById('aiUserInput');
    const messagesEl = document.getElementById('aiChatMessages');
    const userMessage = inputEl.value.trim();
    if (!userMessage) return;

    // Render User Message
    messagesEl.innerHTML += `
      <div class="bg-navy text-white p-3 rounded-2xl max-w-[85%] ml-auto text-xs shadow-md">
        ${userMessage}
      </div>
    `;
    inputEl.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const apiKey = localStorage.getItem('caribbe_ai_studio_key') || '';

    // Render Loading Badge
    const loadingId = 'loading_' + Date.now();
    messagesEl.innerHTML += `
      <div id="${loadingId}" class="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 max-w-[85%] text-xs shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-sm animate-spin text-navy">progress_activity</span>
        <span>Consultando en Google AI Studio (Gemini)...</span>
      </div>
    `;
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      let aiResponseText = '';

      if (apiKey) {
        // Fetch dynamic rules from Firebase if available
        let dynamicRules = '';
        try {
          if (window.CaribbeFirebase && window.CaribbeFirebase.getAiRules) {
            const rules = await window.CaribbeFirebase.getAiRules();
            if (rules && rules.length > 0) {
              dynamicRules = '\n\nREGLAS PERSONALIZADAS DE LA BASE DE CONOCIMIENTOS (Prioridad Máxima):\n';
              rules.forEach(r => {
                dynamicRules += `- Si el cliente pregunta sobre "${r.question}", DEBES responder con: "${r.answer}"\n`;
              });
            }
          }
        } catch(e) {}

        const finalSystemInstruction = DEFAULT_SYSTEM_INSTRUCTION + dynamicRules;

        // Direct call to Google AI Studio REST API (Gemini 1.5 Flash)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: finalSystemInstruction + '\n\nPregunta del cliente: ' + userMessage }
                ]
              }
            ]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          aiResponseText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          aiResponseText = `⚠️ Error de API Key: ${data.error.message}. Verifica tu API Key de Google AI Studio.`;
        } else {
          aiResponseText = 'No se obtuvo respuesta del modelo Gemini de AI Studio.';
        }
      } else {
        // Smart Local Fallback responding with official details when no key is set yet
        const msgLower = userMessage.toLowerCase();
        if (msgLower.includes('pasaporte')) {
          aiResponseText = 'El pasaporte cubano (Renovación y Primera Vez) tiene un costo de $280. El tiempo estimado de procesamiento es de 2 meses. ¿Deseas iniciar la solicitud en el botón "Solicitar Pasaporte"? Cuba te espera ♡';
        } else if (msgLower.includes('envio') || msgLower.includes('envío') || msgLower.includes('cajas')) {
          aiResponseText = 'Ofrecemos Envíos Aéreos Express (4-7 días) a $6.5/lb para comida/medicina y $7.5/lb para misceláneas. Envíos Marítimos a $3.5/lb. Salidas todos los viernes. Cuba te espera ♡';
        } else if (msgLower.includes('carta') || msgLower.includes('poder') || msgLower.includes('notaria')) {
          aiResponseText = 'Las Cartas Poder y Declaraciones Juradas tienen un costo de $50 cada una, realizadas por Notarias Licenciadas en Arizona. Cuba te espera ♡';
        } else {
          aiResponseText = `¡Gracias por consultar con Caribbe Legal Services en Glendale, AZ! Para una respuesta inteligente personalizada por el modelo Gemini de Google AI Studio, introduce tu API Key en la barra superior. También puedes llamarnos directamente al (480) 479-9891 o (623) 281-8606. Cuba te espera ♡`;
        }
      }

      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      messagesEl.innerHTML += `
        <div class="bg-white p-3 rounded-2xl border border-slate-200 text-slate-800 shadow-sm max-w-[90%] leading-relaxed">
          ${aiResponseText.replace(/\n/g, '<br/>')}
        </div>
      `;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    } catch (error) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      messagesEl.innerHTML += `
        <div class="bg-red-50 text-red-700 p-3 rounded-2xl border border-red-200 max-w-[90%] text-xs">
          Ocurrió un error al consultar la API de Google AI Studio: ${error.message}
        </div>
      `;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectAIChatWidget();
  });

  window.CaribbeAIStudio = {
    toggleChat: toggleChat,
    setApiKey: setApiKey,
    sendMessage: sendMessage
  };
})();
