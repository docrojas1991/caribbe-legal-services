/**
 * Caribbe Legal Services - Passport Flow Engine (v3.0 Official Master Edition)
 * Robust step detection, auto-save/fill, validation, progress bar, and confirmation routing.
 */

(function () {
  const STORAGE_KEY = 'caribbe_passport_flow_data';

  // Helper to get stored data
  function getFlowData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  // Helper to save stored data
  function saveFlowData(newData) {
    try {
      const current = getFlowData();
      const updated = { ...current, ...newData, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error saving passport flow data:', e);
    }
  }

  // Generate reference number if not existing
  function getOrCreateRefNumber() {
    let data = getFlowData();
    if (!data.refNumber) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      data.refNumber = 'CLS-' + new Date().getFullYear() + '-' + randomNum;
      saveFlowData(data);
    }
    localStorage.setItem('cls_solicitud_codigo', data.refNumber);
    if (data.tramite) {
      localStorage.setItem('cls_solicitud_tramite', data.tramite);
    }
    return data.refNumber;
  }

  // Auto-fill forms on step load
  function autoFillForm() {
    const data = getFlowData();
    const form = document.querySelector('form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const key = input.name || input.id;
      if (!key) return;

      if (input.type === 'radio') {
        if (data[input.name] === input.value) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (input.type === 'checkbox') {
        if (data[key]) {
          input.checked = true;
        }
      } else if (data[key] !== undefined && data[key] !== null) {
        input.value = data[key];
      }
    });
  }

  // Save current step data from form
  function saveFormStep(e) {
    if (e && e.preventDefault) e.preventDefault();
    const form = document.querySelector('form');
    if (!form) return {};

    const formData = new FormData(form);
    const stepData = {};

    for (let [key, value] of formData.entries()) {
      if (stepData[key]) {
        if (!Array.isArray(stepData[key])) {
          stepData[key] = [stepData[key]];
        }
        stepData[key].push(value);
      } else {
        stepData[key] = value;
      }
    }

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const key = input.name || input.id || `field_${index}`;
      if (input.type === 'radio') {
        if (input.checked) {
          stepData[input.name || 'tramite'] = input.value;
        }
      } else if (input.type === 'checkbox') {
        if (input.checked) {
          stepData[key] = true;
        }
      } else if (input.type !== 'file') {
        if (input.value) stepData[key] = input.value;
      } else if (input.type === 'file' && input.files && input.files.length > 0) {
        stepData[key] = input.files[0].name;
      }
    });

    const saved = saveFlowData(stepData);
    if (saved.tramite) {
      localStorage.setItem('cls_solicitud_tramite', saved.tramite);
    }
    return saved;
  }

  // Detect current step reliably
  function detectCurrentStep() {
    const path = decodeURIComponent(window.location.pathname).toLowerCase();
    const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
    const titleText = document.title ? document.title.toLowerCase() : '';

    if (path.includes('paso_1') || path.includes('paso-1') || bodyText.includes('paso 1 de 6') || titleText.includes('tipo de tr')) {
      return 1;
    }
    if (path.includes('paso_2') || path.includes('paso-2') || bodyText.includes('paso 2 de 6') || titleText.includes('datos personales')) {
      return 2;
    }
    if (path.includes('paso_3') || path.includes('paso-3') || bodyText.includes('paso 3 de 6') || titleText.includes('empleo') || titleText.includes('ocupacional')) {
      return 3;
    }
    if (path.includes('paso_4') || path.includes('paso-4') || bodyText.includes('paso 4 de 6') || titleText.includes('referencia en cuba')) {
      return 4;
    }
    if (path.includes('paso_5') || path.includes('paso-5') || bodyText.includes('paso 5 de 6') || titleText.includes('adicionales') || titleText.includes('direcciones')) {
      return 5;
    }
    if (path.includes('paso_6') || path.includes('paso-6') || bodyText.includes('paso 6 de 6') || titleText.includes('documentos') || titleText.includes('fotos')) {
      return 6;
    }
    if (path.includes('confirmac') || bodyText.includes('solicitud exitosa') || bodyText.includes('¡su solicitud ha sido recibida!')) {
      return 7;
    }
    return 0;
  }

  // Setup Step 1 Flow
  function initStep1() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      saveFormStep(e);
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Guardando...';
      setTimeout(() => {
        window.location.href = '../paso_2_datos_personales/code.html';
      }, 250);
    });
  }

  // Generic Step Handler (Steps 2 to 6)
  function initStepGeneric(currentStepNum, nextStepUrl, prevStepUrl) {
    const form = document.querySelector('form');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveFormStep(e);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando y Guardando...';
        }
        setTimeout(() => {
          window.location.href = nextStepUrl;
        }, 300);
      });
    }
  }

  // Setup Confirmation Page Summary
  function initConfirmation() {
    const data = getFlowData();
    const refNum = getOrCreateRefNumber();

    const refElements = document.querySelectorAll('#summaryCode, .ref-number-display');
    refElements.forEach(el => el.textContent = refNum);

    const tramiteElements = document.querySelectorAll('#summaryTramite, .tramite-type-display');
    const tramiteType = data['tramite'] || data['passportCategory'] || 'Renovación de Pasaporte Cubano';
    tramiteElements.forEach(el => el.textContent = tramiteType);
  }

  // Initialize page-specific behaviors
  document.addEventListener('DOMContentLoaded', () => {
    getOrCreateRefNumber();
    autoFillForm();

    const step = detectCurrentStep();

    switch (step) {
      case 1:
        initStep1();
        break;
      case 2:
        initStepGeneric(2, '../paso_3_informaci_n_de_empleo/code.html', '../paso_1_tipo_de_tr_mite/code.html');
        break;
      case 3:
        initStepGeneric(3, '../paso_4_referencia_en_cuba/code.html', '../paso_2_datos_personales/code.html');
        break;
      case 4:
        initStepGeneric(4, '../paso_5_datos_adicionales/code.html', '../paso_3_informaci_n_de_empleo/code.html');
        break;
      case 5:
        initStepGeneric(5, '../paso_6_documentos_y_fotos/code.html', '../paso_4_referencia_en_cuba/code.html');
        break;
      case 6:
        initStepGeneric(6, '../confirmaci_n_de_solicitud/code.html', '../paso_5_datos_adicionales/code.html');
        break;
      case 7:
        initConfirmation();
        break;
      default:
        break;
    }
  });

  // Global window alias for legacy onsubmit handlers
  window.passportFlow = {
    saveStep1: function(e) { saveFormStep(e); window.location.href = '../paso_2_datos_personales/code.html'; },
    saveStep2: function(e) { saveFormStep(e); window.location.href = '../paso_3_informaci_n_de_empleo/code.html'; },
    saveStep3: function(e) { saveFormStep(e); window.location.href = '../paso_4_referencia_en_cuba/code.html'; },
    saveStep4: function(e) { saveFormStep(e); window.location.href = '../paso_5_datos_adicionales/code.html'; },
    saveStep5: function(e) { saveFormStep(e); window.location.href = '../paso_6_documentos_y_fotos/code.html'; },
    saveStep6: function(e) { saveFormStep(e); window.location.href = '../confirmaci_n_de_solicitud/code.html'; }
  };

  window.CaribbePassportFlow = {
    getData: getFlowData,
    saveData: saveFlowData,
    getRefNumber: getOrCreateRefNumber,
    detectStep: detectCurrentStep
  };
})();
