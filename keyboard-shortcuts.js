// ============================================================
// keyboard-shortcuts.js - Atajos de teclado para TimeBook TG
// VERSIÓN COMPLETA - Todos los comandos del index.html
// ============================================================

(function() {
    'use strict';

    console.log('⌨️ keyboard-shortcuts.js: Iniciando atajos de teclado...');

    // ============================================================
    // CONFIGURACIÓN DE ATAJOS (TODOS LOS COMANDOS)
    // ============================================================
    const SHORTCUTS = {
        // ========== REGISTRERING (Registro) ==========
        'save': { 
            keys: ['alt+s'], 
            description: 'Spara post',
            category: '📝 Registrering'
        },
        'cancel': { 
            keys: ['escape'], 
            description: 'Avbryt / Stäng',
            category: '📝 Registrering'
        },
        'newEntry': { 
            keys: ['alt+n'], 
            description: 'Ny registrering',
            category: '📝 Registrering'
        },
        'editLast': { 
            keys: ['f2'], 
            description: 'Redigera senaste posten',
            category: '📝 Registrering'
        },
        'delete': { 
            keys: ['delete'], 
            description: 'Ta bort post',
            category: '📝 Registrering'
        },
        'loadMore': { 
            keys: ['alt+l'], 
            description: 'Ladda fler poster',
            category: '📝 Registrering'
        },

        // ========== NAVIGATION (Navegación) ==========
        'focusDate': { 
            keys: ['alt+d'], 
            description: 'Fokusera datum',
            category: '🔍 Navigation'
        },
        'focusCompany': { 
            keys: ['alt+f'], 
            description: 'Fokusera företag',
            category: '🔍 Navigation'
        },
        'focusProject': { 
            keys: ['alt+p'], 
            description: 'Fokusera projekt',
            category: '🔍 Navigation'
        },
        'focusNotes': { 
            keys: ['alt+a'], 
            description: 'Fokusera anteckningar',
            category: '🔍 Navigation'
        },
        'focusCoworkers': { 
            keys: ['alt+k'], 
            description: 'Fokusera kollegor',
            category: '🔍 Navigation'
        },
        'focusEditCoworkers': { 
            keys: ['alt+shift+k'], 
            description: 'Fokusera kollegor (redigera)',
            category: '🔍 Navigation'
        },
        'focusEditNotes': { 
            keys: ['alt+shift+a'], 
            description: 'Fokusera anteckningar (redigera)',
            category: '🔍 Navigation'
        },
        'search': { 
            keys: ['f3'], 
            description: 'Sök projekt',
            category: '🔍 Navigation'
        },
        'searchHistory': { 
            keys: ['alt+b'], 
            description: 'Sök i historik',
            category: '🔍 Navigation'
        },

        // ========== FILTERS (Filter) ==========
        'focusYearFilter': { 
            keys: ['alt+å'], 
            description: 'Fokusera årsfilter',
            category: '🔍 Filter'
        },
        'focusMonthFilter': { 
            keys: ['alt+ä'], 
            description: 'Fokusera månadsfilter',
            category: '🔍 Filter'
        },
        'focusCompanyFilter': { 
            keys: ['alt+ö'], 
            description: 'Fokusera företagsfilter',
            category: '🔍 Filter'
        },
        'focusProjectFilter': { 
            keys: ['alt+j'], 
            description: 'Fokusera projektfilter',
            category: '🔍 Filter'
        },

        // ========== TOGGLES (Växla) ==========
        'toggleHistory': { 
            keys: ['alt+h'], 
            description: 'Visa/dölj historik',
            category: '📊 Visning'
        },
        'toggleVisual': { 
            keys: ['alt+v'], 
            description: 'Visa/dölj statistik',
            category: '📊 Visning'
        },
        'toggleSummary': { 
            keys: ['alt+m'], 
            description: 'Visa/dölj sammanfattning',
            category: '📊 Visning'
        },
        'toggleSettings': { 
            keys: ['alt+o'], 
            description: 'Visa/dölj inställningar',
            category: '📊 Visning'
        },

        // ========== EXPORT (Exportera) ==========
        'exportPDF': { 
            keys: ['alt+shift+p'], 
            description: 'Exportera PDF',
            category: '📂 Export'
        },
        'exportWord': { 
            keys: ['alt+shift+w'], 
            description: 'Exportera Word',
            category: '📂 Export'
        },
        'print': { 
            keys: ['alt+shift+r'], 
            description: 'Visa rapport',
            category: '📂 Export'
        },

        // ========== MODALS (Modal) ==========
        'editProfile': { 
            keys: ['alt+e'], 
            description: 'Redigera profil',
            category: '⚙️ Övrigt'
        },
        'projectManagement': { 
            keys: ['alt+g'], 
            description: 'Projekthantering',
            category: '⚙️ Övrigt'
        },
        'settings': { 
            keys: ['alt+o'], 
            description: 'Inställningar',
            category: '⚙️ Övrigt'
        },
        'help': { 
            keys: ['f1'], 
            description: 'Hjälp / Genvägar',
            category: '⚙️ Övrigt'
        },

        // ========== PRINT (Utskrift) ==========
        'printCurrentMonth': { 
            keys: ['alt+shift+m'], 
            description: 'Skriv ut aktuell månad',
            category: '🖨️ Utskrift'
        },
    };

    // ============================================================
    // MAPA DE BOTONES A ATAJOS
    // ============================================================
    const BUTTON_MAP = {
        // Botones principales
        '#save-record-btn': 'save',
        '#reset-form': 'cancel',
        '#export-pdf-btn': 'exportPDF',
        '#export-word-btn': 'exportWord',
        '#print-report-btn': 'print',
        
        // Configuración y perfil
        '#settings-btn': 'settings',
        '#manage-projects': 'projectManagement',
        '#edit-user-btn': 'editProfile',
        '#edit-profile-btn': 'editProfile',
        
        // Toggles
        '#toggle-records': 'toggleHistory',
        '#toggle-summary': 'toggleSummary',
        '#toggle-visual': 'toggleVisual',
        
        // Load more
        '#load-more-btn': 'loadMore',
        
        // Botones en modales
        '#delete-record': 'delete',
        '#cancel-edit-record': 'cancel',
    };

    // ============================================================
    // MAPA DE CAMPOS A ATAJOS
    // ============================================================
    const FIELD_MAP = {
        '#entry-date': 'focusDate',
        '#company-search': 'focusCompany',
        '#project-search': 'focusProject',
        '#notes': 'focusNotes',
        '#coworkers': 'focusCoworkers',
        '#edit-coworkers': 'focusEditCoworkers',
        '#edit-notes': 'focusEditNotes',
        '#year-filter': 'focusYearFilter',
        '#month-filter': 'focusMonthFilter',
        '#company-filter': 'focusCompanyFilter',
        '#project-filter': 'focusProjectFilter',
        // Búsqueda en historial (si existe)
        '#history-search': 'searchHistory',
    };

    // ============================================================
    // ESTADO DE NAVEGACIÓN EN DROPDOWNS
    // ============================================================
    const dropdownState = {
        activeDropdown: null,
        activeIndex: -1,
        items: [],
        isNavigating: false
    };

    // ============================================================
    // NAVEGACIÓN POR TECLADO EN DROPDOWNS
    // ============================================================
    function setupDropdownNavigation() {
        document.addEventListener('keydown', function(e) {
            const key = e.key;
            const activeElement = document.activeElement;

            const searchFields = [
                { input: 'company-search', dropdown: 'company-dropdown' },
                { input: 'project-search', dropdown: 'project-dropdown' },
                { input: 'edit-company-search', dropdown: 'edit-company-dropdown' },
                { input: 'edit-project-search', dropdown: 'edit-project-dropdown' }
            ];

            let targetDropdown = null;
            let targetInput = null;

            searchFields.forEach(field => {
                const inputEl = document.getElementById(field.input);
                if (inputEl && (inputEl === activeElement || inputEl.contains(activeElement))) {
                    targetInput = inputEl;
                    targetDropdown = document.getElementById(field.dropdown);
                }
            });

            if (!targetDropdown) return;

            const items = targetDropdown.querySelectorAll('div:not(.p-2.text-gray-500)');
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');

            if (key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                if (!targetDropdown.classList.contains('hidden')) {
                    if (dropdownState.activeIndex < visibleItems.length - 1) {
                        dropdownState.activeIndex++;
                    } else {
                        dropdownState.activeIndex = 0;
                    }
                    highlightDropdownItem(visibleItems, dropdownState.activeIndex, targetInput, targetDropdown);
                }
            } 
            else if (key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();
                if (!targetDropdown.classList.contains('hidden')) {
                    if (dropdownState.activeIndex > 0) {
                        dropdownState.activeIndex--;
                    } else {
                        dropdownState.activeIndex = visibleItems.length - 1;
                    }
                    highlightDropdownItem(visibleItems, dropdownState.activeIndex, targetInput, targetDropdown);
                }
            }
            else if (key === 'Enter') {
                if (dropdownState.activeIndex >= 0 && dropdownState.activeIndex < visibleItems.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    const selectedItem = visibleItems[dropdownState.activeIndex];
                    if (selectedItem) {
                        selectedItem.click();
                        dropdownState.activeIndex = -1;
                        dropdownState.activeDropdown = null;
                        targetDropdown.classList.add('hidden');
                    }
                }
            }
            else if (key === 'Escape') {
                if (!targetDropdown.classList.contains('hidden')) {
                    e.preventDefault();
                    e.stopPropagation();
                    targetDropdown.classList.add('hidden');
                    dropdownState.activeIndex = -1;
                    dropdownState.activeDropdown = null;
                }
            }
            else if (key === 'Tab') {
                targetDropdown.classList.add('hidden');
                dropdownState.activeIndex = -1;
                dropdownState.activeDropdown = null;
            }
        });

        document.addEventListener('click', function(e) {
            const dropdowns = document.querySelectorAll('.company-dropdown, .project-dropdown');
            dropdowns.forEach(dropdown => {
                if (!dropdown.classList.contains('hidden')) {
                    const items = dropdown.querySelectorAll('div:not(.p-2.text-gray-500)');
                    const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
                    if (visibleItems.length > 0) {
                        dropdownState.activeIndex = 0;
                        dropdownState.activeDropdown = dropdown;
                        highlightDropdownItem(visibleItems, 0, null, dropdown);
                    }
                }
            });
        });

        document.addEventListener('click', function(e) {
            const dropdowns = document.querySelectorAll('.company-dropdown, .project-dropdown');
            let clickedInside = false;
            dropdowns.forEach(dropdown => {
                if (dropdown.contains(e.target)) {
                    clickedInside = true;
                }
            });
            if (!clickedInside) {
                dropdownState.activeIndex = -1;
                dropdownState.activeDropdown = null;
            }
        });
    }

    // ============================================================
    // RESALTAR ITEM EN DROPDOWN
    // ============================================================
    function highlightDropdownItem(items, index, inputField, dropdown) {
        items.forEach(item => {
            item.style.backgroundColor = '';
            item.style.color = '';
            item.style.borderRadius = '';
        });

        if (index >= 0 && index < items.length) {
            const item = items[index];
            item.style.backgroundColor = '#3b82f6';
            item.style.color = 'white';
            item.style.borderRadius = '4px';
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            dropdownState.activeIndex = index;
            dropdownState.activeDropdown = dropdown;
        }
    }

    // ============================================================
    // MEJORAR INTERACCIÓN CON DROPDOWNS
    // ============================================================
    function enhanceDropdownInteraction() {
        const dropdownConfigs = [
            { input: 'company-search', dropdown: 'company-dropdown', hidden: 'selected-company-id' },
            { input: 'project-search', dropdown: 'project-dropdown', hidden: 'selected-project-id' },
            { input: 'edit-company-search', dropdown: 'edit-company-dropdown', hidden: 'edit-selected-company-id' },
            { input: 'edit-project-search', dropdown: 'edit-project-dropdown', hidden: 'edit-selected-project-id' }
        ];

        dropdownConfigs.forEach(config => {
            const input = document.getElementById(config.input);
            const dropdown = document.getElementById(config.dropdown);

            if (!input || !dropdown) return;

            input.addEventListener('focus', function() {
                if (this.value.length > 0) {
                    dropdown.classList.remove('hidden');
                }
            });

            input.addEventListener('input', function() {
                if (this.value.length > 0) {
                    dropdown.classList.remove('hidden');
                    dropdownState.activeIndex = -1;
                } else {
                    dropdown.classList.add('hidden');
                }
            });

            input.addEventListener('blur', function(e) {
                setTimeout(() => {
                    const relatedTarget = e.relatedTarget;
                    if (relatedTarget && dropdown.contains(relatedTarget)) {
                        return;
                    }
                    dropdown.classList.add('hidden');
                }, 200);
            });
        });
    }

    // ============================================================
    // AÑADIR TOOLTIPS A BOTONES
    // ============================================================
    function addTooltipsToButtons() {
        Object.entries(BUTTON_MAP).forEach(([selector, shortcutKey]) => {
            const button = document.querySelector(selector);
            if (button && SHORTCUTS[shortcutKey]) {
                const shortcut = SHORTCUTS[shortcutKey];
                if (!button.hasAttribute('data-has-tooltip')) {
                    button.setAttribute('data-has-tooltip', 'true');
                    button.title = `${shortcut.description} (${shortcut.keys[0]})`;
                    
                    const indicator = document.createElement('span');
                    indicator.className = 'shortcut-indicator text-xs text-gray-400 ml-1';
                    indicator.style.cssText = `
                        font-size: 9px;
                        opacity: 0.6;
                        font-family: monospace;
                    `;
                    indicator.textContent = shortcut.keys[0];
                    button.appendChild(indicator);
                }
            }
        });

        // Tooltips para campos de formulario
        Object.entries(FIELD_MAP).forEach(([selector, shortcutKey]) => {
            const field = document.querySelector(selector);
            if (field && SHORTCUTS[shortcutKey]) {
                const shortcut = SHORTCUTS[shortcutKey];
                if (!field.hasAttribute('data-has-tooltip')) {
                    field.setAttribute('data-has-tooltip', 'true');
                    field.title = `${shortcut.description} (${shortcut.keys[0]})`;
                }
            }
        });
    }

    // ============================================================
    // MOSTRAR AYUDA DE TECLAS
    // ============================================================
    let isHelpVisible = false;

    function showHelpModal() {
        if (isHelpVisible) {
            hideHelpModal();
            return;
        }

        const helpContainer = document.createElement('div');
        helpContainer.id = 'keyboard-help-modal';
        helpContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        helpContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        let html = `
            <div class="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl" style="margin: 20px;">
                <div class="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h3 class="text-xl font-semibold text-blue-600">
                        <i class="fas fa-keyboard mr-2"></i> Tangentbordsgenvägar
                    </h3>
                    <button onclick="document.getElementById('keyboard-help-modal').remove()" 
                            class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-4">
                    <p class="text-sm text-gray-600 mb-4">
                        Tryck på <kbd class="px-2 py-1 bg-gray-100 rounded border">F1</kbd> för att visa/dölja denna hjälp
                    </p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <h4 class="font-semibold text-blue-700 text-sm">📋 Navigation i listor</h4>
                        <p class="text-sm text-blue-600">
                            <kbd class="px-2 py-0.5 bg-white rounded border">↓</kbd> 
                            <kbd class="px-2 py-0.5 bg-white rounded border">↑</kbd> 
                            Navigera &nbsp;|&nbsp; 
                            <kbd class="px-2 py-0.5 bg-white rounded border">Enter</kbd> Välj &nbsp;|&nbsp; 
                            <kbd class="px-2 py-0.5 bg-white rounded border">Esc</kbd> Stäng
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
        `;

        // Agrupar por categoría
        const categories = {};
        Object.entries(SHORTCUTS).forEach(([key, shortcut]) => {
            const category = shortcut.category || '📌 Övrigt';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({ key, shortcut });
        });

        Object.entries(categories).forEach(([category, items]) => {
            html += `
                <div class="col-span-1 md:col-span-2">
                    <h4 class="font-semibold text-gray-700 mt-3 mb-1 border-b pb-1">${category}</h4>
                </div>
            `;
            items.forEach(({ key, shortcut }) => {
                html += `
                    <div class="flex justify-between items-center p-1.5 hover:bg-gray-50 rounded">
                        <span class="text-sm">${shortcut.description}</span>
                        <kbd class="px-2 py-0.5 bg-gray-100 rounded border text-xs font-mono">${shortcut.keys[0]}</kbd>
                    </div>
                `;
            });
        });

        html += `
                    </div>
                    <div class="mt-4 text-xs text-gray-500 border-t pt-3">
                        <i class="fas fa-info-circle mr-1"></i> 
                        <span>Använd <kbd class="px-1 bg-gray-100 rounded border">Alt</kbd> + tangent för de flesta genvägar</span>
                    </div>
                </div>
            </div>
        `;

        helpContainer.innerHTML = html;
        document.body.appendChild(helpContainer);
        isHelpVisible = true;

        helpContainer.addEventListener('click', (e) => {
            if (e.target === helpContainer) {
                hideHelpModal();
            }
        });
    }

    function hideHelpModal() {
        const modal = document.getElementById('keyboard-help-modal');
        if (modal) {
            modal.remove();
        }
        isHelpVisible = false;
    }

    // ============================================================
    // DETECTAR ATAJOS DE TECLADO
    // ============================================================
    function handleKeyboardShortcuts(e) {
        const key = e.key.toLowerCase();
        const alt = e.altKey;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        const activeElement = document.activeElement;
        const isInputField = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT'
        );

        // Escape siempre manejar
        if (key === 'escape') {
            e.preventDefault();
            e.stopPropagation();
            handleEscape();
            return;
        }

        // F1 siempre manejar
        if (key === 'f1') {
            e.preventDefault();
            e.stopPropagation();
            showHelpModal();
            return;
        }

        // F2 - Editar último (excepto en campos de texto)
        if (key === 'f2' && !isInputField) {
            e.preventDefault();
            e.stopPropagation();
            executeAction('editLast');
            return;
        }

        // F3 - Buscar proyecto
        if (key === 'f3') {
            e.preventDefault();
            e.stopPropagation();
            executeAction('search');
            return;
        }

        // Delete - Solo en modales
        if (key === 'delete') {
            const editModal = document.getElementById('edit-record-modal');
            if (editModal && !editModal.classList.contains('hidden')) {
                e.preventDefault();
                e.stopPropagation();
                executeAction('delete');
                return;
            }
        }

        // Combinaciones con Alt
        if (alt) {
            let combo = 'alt+';
            if (shift) combo += 'shift+';
            combo += key;

            Object.entries(SHORTCUTS).forEach(([action, shortcut]) => {
                const shortcutKey = shortcut.keys[0].toLowerCase().replace(/ /g, '');
                if (combo === shortcutKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    executeAction(action);
                }
            });
        }

        // Enter en botones enfocados
        if (key === 'enter' && activeElement) {
            if (activeElement.tagName === 'BUTTON' || 
                activeElement.type === 'submit' ||
                activeElement.closest('button')) {
                const button = activeElement.closest('button') || activeElement;
                if (button.id !== 'keyboard-help-modal') {
                    button.click();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    }

    // ============================================================
    // EJECUTAR ACCIONES
    // ============================================================
    function executeAction(action) {
        showShortcutFeedback(action);

        switch (action) {
            // ===== REGISTRERING =====
            case 'save':
                const saveBtn = document.getElementById('save-record-btn');
                if (saveBtn) {
                    const form = document.getElementById('time-entry-form');
                    if (form) {
                        form.dispatchEvent(new Event('submit', { bubbles: true }));
                    } else {
                        saveBtn.click();
                    }
                }
                break;

            case 'cancel':
                const resetBtn = document.getElementById('reset-form');
                if (resetBtn) resetBtn.click();
                document.querySelectorAll('.fixed.inset-0:not(.hidden)').forEach(modal => {
                    if (!modal.id.includes('keyboard-help')) {
                        const closeBtn = modal.querySelector('[class*="fa-times"]');
                        if (closeBtn) closeBtn.click();
                    }
                });
                break;

            case 'newEntry':
                const dateInput = document.getElementById('entry-date');
                if (dateInput) {
                    dateInput.focus();
                    dateInput.select();
                }
                break;

            case 'editLast':
                editLastRecord();
                break;

            case 'delete':
                const deleteBtn = document.getElementById('delete-record');
                if (deleteBtn) deleteBtn.click();
                break;

            case 'loadMore':
                const loadBtn = document.getElementById('load-more-btn');
                if (loadBtn) loadBtn.click();
                break;

            // ===== NAVIGATION =====
            case 'focusDate':
                focusField('entry-date');
                break;

            case 'focusCompany':
                focusField('company-search', 'company-dropdown');
                break;

            case 'focusProject':
                focusField('project-search');
                break;

            case 'focusNotes':
                focusField('notes');
                break;

            case 'focusCoworkers':
                focusField('coworkers');
                break;

            case 'focusEditCoworkers':
                focusField('edit-coworkers');
                break;

            case 'focusEditNotes':
                focusField('edit-notes');
                break;

            case 'search':
                focusField('project-search');
                break;

            case 'searchHistory':
                focusField('history-search');
                break;

            // ===== FILTERS =====
            case 'focusYearFilter':
                focusField('year-filter');
                break;

            case 'focusMonthFilter':
                focusField('month-filter');
                break;

            case 'focusCompanyFilter':
                focusField('company-filter');
                break;

            case 'focusProjectFilter':
                focusField('project-filter');
                break;

            // ===== TOGGLES =====
            case 'toggleHistory':
                const historyToggle = document.getElementById('toggle-records');
                if (historyToggle) historyToggle.click();
                break;

            case 'toggleVisual':
                const visualToggle = document.querySelector('[onclick="toggleVisual()"]') || 
                                    document.getElementById('toggle-visual');
                if (visualToggle) visualToggle.click();
                break;

            case 'toggleSummary':
                const summaryToggle = document.getElementById('toggle-summary');
                if (summaryToggle) summaryToggle.click();
                break;

            case 'toggleSettings':
                const settingsToggle = document.getElementById('settings-btn');
                if (settingsToggle) settingsToggle.click();
                break;

            // ===== EXPORT =====
            case 'exportPDF':
                const pdfBtn = document.getElementById('export-pdf-btn');
                if (pdfBtn) pdfBtn.click();
                break;

            case 'exportWord':
                const wordBtn = document.getElementById('export-word-btn');
                if (wordBtn) wordBtn.click();
                break;

            case 'print':
                const printBtn = document.getElementById('print-report-btn');
                if (printBtn) printBtn.click();
                break;

            // ===== MODALS =====
            case 'editProfile':
                const profileBtn = document.getElementById('edit-user-btn') || 
                                  document.getElementById('edit-profile-btn');
                if (profileBtn) profileBtn.click();
                break;

            case 'projectManagement':
                const projectBtn = document.getElementById('manage-projects');
                if (projectBtn) projectBtn.click();
                break;

            case 'settings':
                const settingsBtn = document.getElementById('settings-btn');
                if (settingsBtn) settingsBtn.click();
                break;

            case 'help':
                showHelpModal();
                break;

            // ===== PRINT =====
            case 'printCurrentMonth':
                const printModalBtn = document.getElementById('print-report-btn');
                if (printModalBtn) {
                    printModalBtn.click();
                    // Esperar a que el modal se abra y marcar current month
                    setTimeout(() => {
                        const currentMonthCheck = document.getElementById('print-current-month');
                        if (currentMonthCheck) {
                            currentMonthCheck.checked = true;
                            const event = new Event('change');
                            currentMonthCheck.dispatchEvent(event);
                        }
                    }, 300);
                }
                break;

            default:
                console.log('⌨️ Atajo no reconocido:', action);
        }
    }

    // ============================================================
    // FUNCIONES DE AYUDA
    // ============================================================
    function focusField(fieldId, dropdownId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.focus();
            field.select();
            if (dropdownId) {
                const dropdown = document.getElementById(dropdownId);
                if (dropdown && field.value.length > 0) {
                    dropdown.classList.remove('hidden');
                }
            }
        }
    }

    function editLastRecord() {
        const editButtons = document.querySelectorAll('.edit-record');
        if (editButtons.length > 0) {
            editButtons[0].click();
            showTemporaryMessage('✏️ Redigerar senaste posten');
        } else {
            showTemporaryMessage('ℹ️ Inga poster att redigera');
        }
    }

    function handleEscape() {
        // Cerrar dropdowns
        const dropdowns = document.querySelectorAll('.company-dropdown, .project-dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
                dropdownState.activeIndex = -1;
                dropdownState.activeDropdown = null;
                return;
            }
        });

        // Cerrar modales
        const modals = document.querySelectorAll('.fixed.inset-0:not(.hidden)');
        let closed = false;
        modals.forEach(modal => {
            if (!modal.id.includes('keyboard-help')) {
                const closeBtn = modal.querySelector('[class*="fa-times"]');
                if (closeBtn) {
                    closeBtn.click();
                    closed = true;
                }
            }
        });
        if (!closed) {
            const resetBtn = document.getElementById('reset-form');
            if (resetBtn) resetBtn.click();
        }
        if (isHelpVisible) hideHelpModal();
    }

    // ============================================================
    // FEEDBACK VISUAL
    // ============================================================
    function showShortcutFeedback(action) {
        const shortcut = SHORTCUTS[action];
        if (!shortcut) return;
        showTemporaryMessage(`⌨️ ${shortcut.description}`);
    }

    function showTemporaryMessage(message) {
        const old = document.querySelector('.shortcut-feedback');
        if (old) old.remove();

        const div = document.createElement('div');
        div.className = 'shortcut-feedback fixed top-20 left-1/2 transform -translate-x-1/2 z-50';
        div.style.cssText = `
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: fadeInDown 0.3s ease;
            pointer-events: none;
            z-index: 99999;
        `;
        div.textContent = message;

        if (!document.getElementById('shortcut-styles')) {
            const style = document.createElement('style');
            style.id = 'shortcut-styles';
            style.textContent = `
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes fadeOutUp {
                    from { opacity: 1; transform: translate(-50%, 0); }
                    to { opacity: 0; transform: translate(-50%, -20px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(div);
        setTimeout(() => {
            div.style.animation = 'fadeOutUp 0.3s ease';
            setTimeout(() => div.remove(), 300);
        }, 1500);
    }

    // ============================================================
    // CONFIGURAR MODALES
    // ============================================================
    function setupModalTooltips() {
        const editModal = document.getElementById('edit-record-modal');
        if (editModal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!editModal.classList.contains('hidden') && editModal.classList.contains('flex')) {
                            setTimeout(() => {
                                const modalButtons = editModal.querySelectorAll('button');
                                modalButtons.forEach(btn => {
                                    if (btn.id === 'delete-record') {
                                        btn.title = `${SHORTCUTS.delete.description} (${SHORTCUTS.delete.keys[0]})`;
                                    }
                                    if (btn.type === 'submit') {
                                        btn.title = `${SHORTCUTS.save.description} (${SHORTCUTS.save.keys[0]})`;
                                    }
                                    if (btn.id === 'cancel-edit-record') {
                                        btn.title = `${SHORTCUTS.cancel.description} (${SHORTCUTS.cancel.keys[0]})`;
                                    }
                                });
                            }, 100);
                        }
                    }
                });
            });
            observer.observe(editModal, { attributes: true, attributeFilter: ['class'] });
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    function initKeyboardShortcuts() {
        console.log('⌨️ keyboard-shortcuts.js: Configurando todos los atajos...');
        
        addTooltipsToButtons();
        setupModalTooltips();
        setupDropdownNavigation();
        enhanceDropdownInteraction();
        
        document.addEventListener('keydown', handleKeyboardShortcuts);

        const indicator = document.createElement('div');
        indicator.className = 'fixed bottom-20 left-4 text-xs text-gray-400 opacity-50';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            font-size: 10px;
            color: #9ca3af;
            opacity: 0.5;
            z-index: 50;
            pointer-events: none;
        `;
        indicator.textContent = '⌨️ F1 - Hjälp | ↑↓ Enter - Navigera';
        document.body.appendChild(indicator);

        console.log('✅ keyboard-shortcuts.js: Listo!');
        console.log(`   📋 ${Object.keys(SHORTCUTS).length} genvägar tillgängliga`);
        console.log('   💾 Alt+S - Spara | ✏️ F2 - Redigera senaste');
        console.log('   🔽 🔼 Enter - Navigera i listor');
        console.log('   ❌ Escape - Avbryt/Stäng');
    }

    // ============================================================
    // EXPONER FUNCIONES
    // ============================================================
    window.KeyboardShortcuts = {
        init: initKeyboardShortcuts,
        showHelp: showHelpModal,
        hideHelp: hideHelpModal,
        getShortcuts: () => ({ ...SHORTCUTS }),
    };

    // ============================================================
    // INICIAR AUTOMÁTICAMENTE
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
    } else {
        setTimeout(initKeyboardShortcuts, 1000);
    }

    console.log('✅ keyboard-shortcuts.js: Cargado correctamente!');

})();