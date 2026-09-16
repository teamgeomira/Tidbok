// ============================================================
// standar.js - Cache de Företag/Projekt en Firebase RTDB
// Guarda el último "Företag" y "Projekt" usados en
// "Registrera timmar" dentro de:
//   users/{uid}/standar/lastSelection/lastCompany
//   users/{uid}/standar/lastSelection/lastProject
// y los restaura al recargar la página o tras guardar/limpiar.
// ============================================================

(function () {
    'use strict';

    const DB_PATH = 'standar/lastSelection';
    const log = (...args) => console.log('🗂️ standar.js:', ...args);

    let db = null;
    let auth = null;
    let currentUser = null;
    let cachedCompany = null;   // { id, name, updatedAt }
    let cachedProject = null;   // { id, label, companyId, updatedAt }
    let ready = false;

    // ----------------------------------------------------------
    // 1) Esperar a que Firebase esté disponible (index.html lo
    //    inicializa con firebase.initializeApp(...) en <head>)
    // ----------------------------------------------------------
    function waitForFirebase(callback, attempts) {
        attempts = attempts || 0;
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            try {
                db = firebase.database();
                auth = firebase.auth();
                callback();
            } catch (e) {
                console.warn('standar.js: Error inicializando Firebase:', e);
            }
        } else if (attempts < 80) {   // hasta ~40s
            setTimeout(() => waitForFirebase(callback, attempts + 1), 500);
        } else {
            console.warn('standar.js: Firebase no disponible tras esperar.');
        }
    }

    // ----------------------------------------------------------
    // 2) Guardar en Firebase
    // ----------------------------------------------------------
    function saveCompany(id, name) {
        if (!ready || !currentUser || !id) return;
        const data = {
            id: id,
            name: name || '',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        cachedCompany = data;
        db.ref(`users/${currentUser.uid}/${DB_PATH}/lastCompany`).set(data)
            .then(() => log('💾 Företag →', name))
            .catch(err => console.warn('standar.js: Error guardando empresa:', err));
    }

    function saveProject(id, label, companyId) {
        if (!ready || !currentUser || !id) return;
        const data = {
            id: id,
            label: label || '',
            companyId: companyId || '',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        cachedProject = data;
        db.ref(`users/${currentUser.uid}/${DB_PATH}/lastProject`).set(data)
            .then(() => log('💾 Projekt →', label))
            .catch(err => console.warn('standar.js: Error guardando proyecto:', err));
    }

    // ----------------------------------------------------------
    // 3) Cargar desde Firebase
    // ----------------------------------------------------------
    function loadFromFirebase() {
        if (!ready || !currentUser || !db) return Promise.resolve(null);
        return db.ref(`users/${currentUser.uid}/${DB_PATH}`).once('value')
            .then(snapshot => {
                const data = snapshot.val() || {};
                cachedCompany = data.lastCompany || null;
                cachedProject = data.lastProject || null;
                log('📥 Cargado de Firebase →',
                    { company: cachedCompany && cachedCompany.name,
                      project: cachedProject && cachedProject.label });
                return data;
            })
            .catch(err => {
                console.warn('standar.js: Error cargando de Firebase:', err);
                return null;
            });
    }

    // ----------------------------------------------------------
    // 4) Acceso seguro al `state` global de index.html
    //    (const state = {...} en script clásico → accesible por nombre)
    // ----------------------------------------------------------
    function getState() {
        try {
            return typeof state !== 'undefined' ? state : null;
        } catch (e) {
            return null;
        }
    }

    function stateReady() {
        const st = getState();
        return !!(st && st.companies && Object.keys(st.companies).length > 0);
    }

    // ----------------------------------------------------------
    // 5) Escuchar selecciones del usuario en los dropdowns
    // ----------------------------------------------------------
    function attachSaveListeners() {
        // Företag
        const companyDropdown = document.getElementById('company-dropdown');
        if (companyDropdown && !companyDropdown.dataset.standarBound) {
            companyDropdown.dataset.standarBound = '1';
            companyDropdown.addEventListener('click', (e) => {
                const item = e.target.closest('div[data-id]');
                if (!item) return;
                saveCompany(item.dataset.id, item.textContent.trim());
            });
        }

        // Projekt (guarda también el companyId actual)
        const projectDropdown = document.getElementById('project-dropdown');
        if (projectDropdown && !projectDropdown.dataset.standarBound) {
            projectDropdown.dataset.standarBound = '1';
            projectDropdown.addEventListener('click', (e) => {
                const item = e.target.closest('div[data-id]');
                if (!item) return;
                const companyId = document.getElementById('selected-company-id')?.value || '';
                saveProject(item.dataset.id, item.textContent.trim(), companyId);
            });
        }

        // Por si el usuario selecciona empresa vía autocompletado sin click en dropdown
        const hiddenCompany = document.getElementById('selected-company-id');
        if (hiddenCompany && !hiddenCompany.dataset.standarBound) {
            hiddenCompany.dataset.standarBound = '1';
            hiddenCompany.addEventListener('change', () => {
                const cId = hiddenCompany.value;
                const cName = document.getElementById('company-search')?.value || '';
                if (cId) saveCompany(cId, cName);
            });
        }

        const hiddenProject = document.getElementById('selected-project-id');
        if (hiddenProject && !hiddenProject.dataset.standarBound) {
            hiddenProject.dataset.standarBound = '1';
            hiddenProject.addEventListener('change', () => {
                const pId = hiddenProject.value;
                const pLabel = document.getElementById('project-search')?.value || '';
                const cId = document.getElementById('selected-company-id')?.value || '';
                if (pId) saveProject(pId, pLabel, cId);
            });
        }

        // Al enviar el formulario, hacemos una última persistencia por seguridad
        const form = document.getElementById('time-entry-form');
        if (form && !form.dataset.standarSubmitBound) {
            form.dataset.standarSubmitBound = '1';
            form.addEventListener('submit', () => {
                const cId = document.getElementById('selected-company-id')?.value || '';
                const cName = document.getElementById('company-search')?.value || '';
                const pId = document.getElementById('selected-project-id')?.value || '';
                const pLabel = document.getElementById('project-search')?.value || '';
                const st = getState();

                if (cId) saveCompany(cId, cName);
                if (pId && st && st.projects && st.projects[pId] &&
                    st.projects[pId].companyId === cId) {
                    saveProject(pId, pLabel, cId);
                }
            });
        }
    }

    // ----------------------------------------------------------
    // 6) Restaurar en el formulario
    // ----------------------------------------------------------
    function restoreFields() {
        if (!stateReady() || !cachedCompany || !cachedCompany.id) return false;

        const st = getState();

        const companySearch     = document.getElementById('company-search');
        const selectedCompanyId = document.getElementById('selected-company-id');
        const projectSearch     = document.getElementById('project-search');
        const selectedProjectId = document.getElementById('selected-project-id');
        const clearCompanyBtn   = document.getElementById('clear-company-search');
        const clearProjectBtn   = document.getElementById('clear-project-search');

        if (!companySearch || !selectedCompanyId) return false;

        // No sobreescribir si el usuario ya tenía algo seleccionado
        if (selectedCompanyId.value && companySearch.value) return true;

        // La empresa cacheada debe seguir existiendo en `state.companies`
        if (!st.companies[cachedCompany.id]) {
            log('⚠️ Empresa cacheada ya no existe, se omite restauración.');
            return false;
        }

        const company = st.companies[cachedCompany.id];
        companySearch.value     = company.name || cachedCompany.name || '';
        selectedCompanyId.value = cachedCompany.id;
        if (clearCompanyBtn) clearCompanyBtn.classList.remove('hidden');

        // Habilitar buscador de proyectos (igual que hace loadProjectsForCompany)
        if (projectSearch) projectSearch.disabled = false;

        // Restaurar proyecto si pertenece a esta empresa y aún existe
        if (cachedProject && cachedProject.id &&
            st.projects && st.projects[cachedProject.id] &&
            st.projects[cachedProject.id].companyId === cachedCompany.id) {

            const project = st.projects[cachedProject.id];
            const label = `${project.code} - ${project.name}`;

            if (projectSearch)     projectSearch.value     = label;
            if (selectedProjectId) selectedProjectId.value = cachedProject.id;
            if (clearProjectBtn)   clearProjectBtn.classList.remove('hidden');
        }

        log('♻️ Restaurado →', company.name,
            '|', (projectSearch && projectSearch.value) || '(sin proyecto)');
        return true;
    }

    function waitAndRestore() {
        let attempts = 0;
        const maxAttempts = 80;   // ~40s
        const tick = () => {
            attempts++;
            if (restoreFields()) return;
            if (attempts < maxAttempts) setTimeout(tick, 500);
        };
        tick();
    }

    // ----------------------------------------------------------
    // 7) Hooks para que tras "Guardar" o "Avbryt" se restaure
    // ----------------------------------------------------------
    function hookFormReset() {
        // Reset programático: resetTimeEntryForm() desde index.html
        try {
            if (typeof resetTimeEntryForm === 'function' &&
                !resetTimeEntryForm.__standarHooked) {
                const original = resetTimeEntryForm;
                const wrapped = function () {
                    const result = original.apply(this, arguments);
                    setTimeout(() => restoreFields(), 300);
                    return result;
                };
                wrapped.__standarHooked = true;
                window.resetTimeEntryForm = wrapped;
                log('🪝 Hook aplicado a resetTimeEntryForm');
            }
        } catch (e) { /* noop */ }

        // Reset nativo del <form>
        const form = document.getElementById('time-entry-form');
        if (form && !form.dataset.standarResetBound) {
            form.dataset.standarResetBound = '1';
            form.addEventListener('reset', () => {
                setTimeout(() => restoreFields(), 300);
            });
        }

        // Botón Avbryt
        const resetBtn = document.getElementById('reset-form');
        if (resetBtn && !resetBtn.dataset.standarResetBound) {
            resetBtn.dataset.standarResetBound = '1';
            resetBtn.addEventListener('click', () => {
                setTimeout(() => restoreFields(), 400);
            });
        }
    }

    // ----------------------------------------------------------
    // 8) Ciclo de vida
    // ----------------------------------------------------------
    function startWithUser(user) {
        currentUser = user;
        ready = true;
        log('👤 Usuario listo:', user.uid);

        // Cargamos primero desde Firebase, luego atamos listeners y restauramos
        loadFromFirebase().then(() => {
            attachSaveListeners();
            hookFormReset();
            waitAndRestore();
        });
    }

    function init() {
        waitForFirebase(() => {
            log('🔥 Firebase disponible. Esperando autenticación...');

            auth.onAuthStateChanged(user => {
                if (user) {
                    startWithUser(user);
                } else {
                    currentUser = null;
                    cachedCompany = null;
                    cachedProject = null;
                    ready = false;
                }
            });

            // Observar el DOM por si se recrean nodos en el modal
            const observer = new MutationObserver(() => {
                if (ready) {
                    attachSaveListeners();
                    hookFormReset();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 400);
    }

    // ----------------------------------------------------------
    // 9) API pública
    // ----------------------------------------------------------
    window.Standar = {
        saveCompany,
        saveProject,
        restore: restoreFields,
        reload: () => loadFromFirebase().then(restoreFields),
        clear: () => {
            if (!ready || !currentUser) return Promise.resolve();
            return db.ref(`users/${currentUser.uid}/${DB_PATH}`).remove()
                .then(() => {
                    cachedCompany = null;
                    cachedProject = null;
                    log('🧹 Cache limpiado en Firebase');
                });
        },
        getCached: () => ({
            company: cachedCompany,
            project: cachedProject
        })
    };
})();