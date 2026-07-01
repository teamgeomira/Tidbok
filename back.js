// ============================================================
// back.js - AutoGuardado en Firebase para TimeBook TG
// Guarda automáticamente los campos de texto en Firebase
// y los restaura al recargar la página
// ============================================================

// ============================================================
// CONFIGURACIÓN DE FIREBASE (usando la misma que index.html)
// ============================================================
const firebaseConfigBack = {
  apiKey: "AIzaSyAI-VxrbSC-d1WscOkpY9d8NaEUgdjneeE",
  authDomain: "tidbok-df555.firebaseapp.com",
  databaseURL: "https://tidbok-df555-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tidbok-df555",
  storageBucket: "tidbok-df555.firebasestorage.app",
  messagingSenderId: "467331966400",
  appId: "1:467331966400:web:abb6949a76918f2eb8d425"
};

// Inicializar Firebase solo si no está ya inicializado
if (!firebase.apps || firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfigBack);
}
const authBack = firebase.auth();
const databaseBack = firebase.database();

// ============================================================
// ESTADO DEL AUTOGUARDADO
// ============================================================
const autoSaveState = {
  enabled: true,
  debounceTimer: null,
  debounceDelay: 800, // ms de espera antes de guardar
  userId: null,
  currentTab: 'notes', // 'notes' o 'edit-notes'
  initialized: false
};

// ============================================================
// OBTENER EL USUARIO ACTUAL
// ============================================================
function getCurrentUserForBack() {
  return new Promise((resolve) => {
    const unsubscribe = authBack.onAuthStateChanged(user => {
      unsubscribe();
      if (user) {
        autoSaveState.userId = user.uid;
        resolve(user);
      } else {
        autoSaveState.userId = null;
        resolve(null);
      }
    });
  });
}

// ============================================================
// GUARDAR AUTOMÁTICAMENTE EN FIREBASE
// ============================================================
function autoSaveToFirebase(fieldId, content) {
  if (!autoSaveState.enabled) return;
  if (!autoSaveState.userId) {
    // Intentar obtener el usuario
    getCurrentUserForBack().then(user => {
      if (user) {
        autoSaveToFirebase(fieldId, content);
      }
    });
    return;
  }

  // Limpiar el timer anterior
  if (autoSaveState.debounceTimer) {
    clearTimeout(autoSaveState.debounceTimer);
  }

  // Solo guardar si hay contenido
  if (!content || content.trim() === '') {
    // Si está vacío, eliminar el borrador
    autoSaveState.debounceTimer = setTimeout(() => {
      databaseBack.ref(`users/${autoSaveState.userId}/drafts/${fieldId}`).remove()
        .catch(err => console.warn('back.js: Error al eliminar borrador vacío:', err));
    }, autoSaveState.debounceDelay);
    return;
  }

  // Guardar con debounce
  autoSaveState.debounceTimer = setTimeout(() => {
    const draftData = {
      content: content,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      fieldId: fieldId
    };
    databaseBack.ref(`users/${autoSaveState.userId}/drafts/${fieldId}`).set(draftData)
      .then(() => {
        // Mostrar indicador de guardado (opcional)
        showAutoSaveIndicator(fieldId, true);
      })
      .catch(err => {
        console.warn('back.js: Error al guardar borrador:', err);
        showAutoSaveIndicator(fieldId, false);
      });
  }, autoSaveState.debounceDelay);
}

// ============================================================
// RECUPERAR BORRADORES GUARDADOS
// ============================================================
function loadDraftsFromFirebase() {
  if (!autoSaveState.userId) {
    getCurrentUserForBack().then(user => {
      if (user) {
        autoSaveState.userId = user.uid;
        loadDraftsFromFirebase();
      }
    });
    return;
  }

  databaseBack.ref(`users/${autoSaveState.userId}/drafts`).once('value')
    .then(snapshot => {
      const drafts = snapshot.val();
      if (!drafts) return;

      // Recuperar cada campo guardado
      Object.keys(drafts).forEach(fieldId => {
        const draft = drafts[fieldId];
        if (!draft || !draft.content) return;

        // Buscar el campo en la página
        const fieldElement = document.getElementById(fieldId);
        if (fieldElement) {
          // Solo restaurar si el campo está vacío (no ha sido editado por el usuario)
          if (fieldElement.value === '' || fieldElement.value === fieldElement.defaultValue) {
            fieldElement.value = draft.content;
            
            // Disparar eventos para actualizar cualquier lógica asociada
            fieldElement.dispatchEvent(new Event('input', { bubbles: true }));
            fieldElement.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log(`back.js: Borrador restaurado para "${fieldId}"`);
            
            // Mostrar indicador de restauración
            showRestoreIndicator(fieldId);
          }
        }
      });
    })
    .catch(err => {
      console.warn('back.js: Error al cargar borradores:', err);
    });
}

// ============================================================
// ELIMINAR BORRADOR DESPUÉS DE GUARDAR (cuando se guarda el registro)
// ============================================================
function clearDraft(fieldId) {
  if (!autoSaveState.userId) return;
  databaseBack.ref(`users/${autoSaveState.userId}/drafts/${fieldId}`).remove()
    .catch(err => console.warn('back.js: Error al eliminar borrador:', err));
}

// ============================================================
// INDICADORES VISUALES
// ============================================================
function showAutoSaveIndicator(fieldId, success) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  // Buscar o crear el indicador
  let indicator = field.parentElement.querySelector('.auto-save-indicator');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'auto-save-indicator text-xs ml-2';
    indicator.style.transition = 'opacity 0.3s';
    field.parentElement.style.position = 'relative';
    field.parentElement.appendChild(indicator);
  }
  
  indicator.textContent = success ? '✓' : '⚠';
  indicator.style.color = success ? '#10b981' : '#ef4444';
  indicator.style.opacity = '1';
  
  // Ocultar después de 2 segundos
  clearTimeout(indicator._timeout);
  indicator._timeout = setTimeout(() => {
    indicator.style.opacity = '0';
  }, 2000);
}

function showRestoreIndicator(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  let indicator = field.parentElement.querySelector('.auto-save-restore');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'auto-save-restore text-xs ml-2 text-green-600';
    indicator.textContent = '↻ Restaurado';
    field.parentElement.style.position = 'relative';
    field.parentElement.appendChild(indicator);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      if (indicator.parentElement) {
        indicator.remove();
      }
    }, 3000);
  }
}

// ============================================================
// CONFIGURAR LOS CAMPOS DE TEXTO PARA AUTOGUARDADO
// ============================================================
function setupAutoSaveFields() {
  // Campos que queremos autoguardar
  const fieldsToAutoSave = [
    'notes',           // Notas del formulario principal
    'edit-notes'       // Notas en editar registro
  ];

  fieldsToAutoSave.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Guardar cuando el usuario escribe
    field.addEventListener('input', function(e) {
      autoSaveToFirebase(fieldId, this.value);
    });

    // Guardar también al perder el foco (por si acaso)
    field.addEventListener('blur', function(e) {
      autoSaveToFirebase(fieldId, this.value);
    });
  });

  // Configurar los campos de edición
  setupEditFieldsForAutoSave();
}

// ============================================================
// CONFIGURAR CAMPOS DE EDICIÓN (cuando se abre el modal)
// ============================================================
function setupEditFieldsForAutoSave() {
  // Observar el modal de edición
  const editModal = document.getElementById('edit-record-modal');
  if (!editModal) return;

  // Usar MutationObserver para detectar cuando el modal se abre
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!editModal.classList.contains('hidden') && editModal.classList.contains('flex')) {
          // El modal se ha abierto, restaurar el borrador de edit-notes
          const editNotes = document.getElementById('edit-notes');
          if (editNotes && autoSaveState.userId) {
            databaseBack.ref(`users/${autoSaveState.userId}/drafts/edit-notes`).once('value')
              .then(snapshot => {
                const draft = snapshot.val();
                if (draft && draft.content && editNotes.value === '') {
                  editNotes.value = draft.content;
                  editNotes.dispatchEvent(new Event('input', { bubbles: true }));
                  showRestoreIndicator('edit-notes');
                }
              })
              .catch(err => console.warn('back.js: Error al cargar borrador edit-notes:', err));
          }
        }
      }
    });
  });

  observer.observe(editModal, { attributes: true, attributeFilter: ['class'] });
}

// ============================================================
// INTERCEPTAR EL GUARDADO DE REGISTROS PARA LIMPIAR BORRADORES
// ============================================================
function setupSaveInterception() {
  // Interceptar el formulario principal
  const mainForm = document.getElementById('time-entry-form');
  if (mainForm) {
    const originalSubmit = mainForm.onsubmit;
    mainForm.addEventListener('submit', function(e) {
      // Limpiar el borrador de notes después de guardar
      setTimeout(() => {
        clearDraft('notes');
        const notesField = document.getElementById('notes');
        if (notesField) {
          // Quitar cualquier indicador
          const indicator = notesField.parentElement.querySelector('.auto-save-indicator');
          if (indicator) indicator.remove();
        }
      }, 1000);
    });
  }

  // Interceptar el formulario de edición
  const editForm = document.getElementById('edit-record-form');
  if (editForm) {
    editForm.addEventListener('submit', function(e) {
      setTimeout(() => {
        clearDraft('edit-notes');
        const editNotes = document.getElementById('edit-notes');
        if (editNotes) {
          const indicator = editNotes.parentElement.querySelector('.auto-save-indicator');
          if (indicator) indicator.remove();
        }
      }, 1000);
    });
  }

  // Limpiar también cuando se cierra el modal de edición
  const closeEditModal = document.getElementById('close-edit-record-modal');
  if (closeEditModal) {
    closeEditModal.addEventListener('click', function() {
      // No limpiar aquí para permitir que el usuario recupere el texto si vuelve a abrir
      // Solo limpiar si el usuario cierra sin guardar y confirma
    });
  }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
function initAutoSaveBack() {
  if (autoSaveState.initialized) return;
  
  console.log('back.js: Inicializando AutoGuardado...');
  
  // Esperar a que el usuario esté autenticado
  authBack.onAuthStateChanged(user => {
    if (user) {
      autoSaveState.userId = user.uid;
      console.log('back.js: Usuario autenticado, cargando borradores...');
      
      // Cargar borradores guardados
      setTimeout(() => {
        loadDraftsFromFirebase();
      }, 500);
      
      // Configurar campos
      setupAutoSaveFields();
      setupSaveInterception();
      setupEditFieldsForAutoSave();
      
      // Marcar como inicializado
      autoSaveState.initialized = true;
    } else {
      console.log('back.js: Usuario no autenticado, esperando...');
    }
  });
}

// ============================================================
// GUARDAR MANUALMENTE (para usar desde botones)
// ============================================================
function forceSaveDraft(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    autoSaveToFirebase(fieldId, field.value);
  }
}

// ============================================================
// EXPONER FUNCIONES PARA USO EXTERNO
// ============================================================
window.Back = {
  init: initAutoSaveBack,
  save: autoSaveToFirebase,
  clear: clearDraft,
  forceSave: forceSaveDraft,
  load: loadDraftsFromFirebase,
  getState: () => ({ ...autoSaveState })
};

// ============================================================
// INICIAR AUTOMÁTICAMENTE CUANDO SE CARGA LA PÁGINA
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoSaveBack);
} else {
  initAutoSaveBack();
}

console.log('back.js: Cargado correctamente. Los textos se guardarán automáticamente.');