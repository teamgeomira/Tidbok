/**
 * notes-autocomplete.js
 * Módulo para autocompletar notas desde una base de datos JSON (notes_database.json)
 * Funciona en los textarea con ID 'notes' (nuevo registro) y 'edit-notes' (edición)
 */

(function() {
    let notesDatabase = [];           // Array de frases únicas
    let lastUsedNotes = [];          // Historial local de frases usadas (máx 10)
    let currentSuggestionBox = null; // Para cerrar sugerencias al hacer clic fuera

    // Cargar la base de datos JSON
    async function loadNotesDatabase() {
        try {
            const response = await fetch('notes_database.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            notesDatabase = await response.json();
            console.log(`📝 Notes database loaded: ${notesDatabase.length} unique phrases`);
            // Cargar historial desde localStorage
            const stored = localStorage.getItem('lastUsedNotes');
            if (stored) lastUsedNotes = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading notes database:', error);
            notesDatabase = [];
        }
    }

    // Guardar historial local
    function saveLastUsedNotes() {
        localStorage.setItem('lastUsedNotes', JSON.stringify(lastUsedNotes.slice(0, 10)));
    }

    // Añadir frase usada al historial (evitar duplicados, mantener orden cronológico inverso)
    function addToLastUsed(phrase) {
        if (!phrase || phrase.trim() === '') return;
        phrase = phrase.trim();
        // Eliminar si ya existe
        const index = lastUsedNotes.indexOf(phrase);
        if (index !== -1) lastUsedNotes.splice(index, 1);
        // Insertar al principio
        lastUsedNotes.unshift(phrase);
        // Mantener solo 10
        if (lastUsedNotes.length > 10) lastUsedNotes.pop();
        saveLastUsedNotes();
    }

    // Función para obtener sugerencias según el texto actual y la posición del cursor
    function getSuggestions(inputText, cursorPos) {
        // Obtener la palabra completa antes del cursor
        let textBeforeCursor = inputText.substring(0, cursorPos);
        // Buscar el inicio de la última palabra (caracteres alfanuméricos, guiones, puntos, etc.)
        let match = textBeforeCursor.match(/[\wåäöÅÄÖ\-\.]+$/);
        if (!match) return [];
        let currentWord = match[0];
        if (currentWord.length < 2) return []; // mínimo 2 caracteres para sugerir

        let lowerWord = currentWord.toLowerCase();
        // Buscar frases que contengan la palabra (no solo al inicio)
        let matches = notesDatabase.filter(phrase => 
            phrase.toLowerCase().includes(lowerWord)
        );
        // Ordenar: primero las que empiezan con la palabra, luego las que contienen
        matches.sort((a, b) => {
            let aStarts = a.toLowerCase().startsWith(lowerWord);
            let bStarts = b.toLowerCase().startsWith(lowerWord);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.length - b.length;
        });
        // Limitar a 10 sugerencias
        matches = matches.slice(0, 10);

        // También mostrar últimas frases usadas si coinciden parcialmente
        let recentMatches = lastUsedNotes.filter(phrase => 
            phrase.toLowerCase().includes(lowerWord) && !matches.includes(phrase)
        ).slice(0, 5);
        return [...recentMatches, ...matches];
    }

    // Crear o actualizar el cuadro de sugerencias
    function showSuggestions(textarea, suggestions) {
        removeSuggestionBox();
        if (!suggestions.length) return;

        const rect = textarea.getBoundingClientRect();
        const box = document.createElement('div');
        box.className = 'suggestion-box';
        box.style.position = 'absolute';
        box.style.backgroundColor = 'white';
        box.style.border = '1px solid #ccc';
        box.style.borderRadius = '4px';
        box.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        box.style.zIndex = '1000';
        box.style.maxHeight = '200px';
        box.style.overflowY = 'auto';
        box.style.width = `${Math.max(textarea.offsetWidth, 300)}px`;
        // Posicionar debajo del textarea
        box.style.top = `${rect.bottom + window.scrollY}px`;
        box.style.left = `${rect.left + window.scrollX}px`;

        suggestions.forEach(phrase => {
            const div = document.createElement('div');
            div.textContent = phrase;
            div.style.padding = '8px 12px';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #eee';
            div.addEventListener('mouseenter', () => div.style.backgroundColor = '#f0f0f0');
            div.addEventListener('mouseleave', () => div.style.backgroundColor = 'white');
            div.addEventListener('click', () => {
                // Reemplazar la palabra actual con la frase completa
                const cursorPos = textarea.selectionStart;
                const text = textarea.value;
                let start = cursorPos;
                let end = cursorPos;
                // Encontrar límites de la palabra actual
                while (start > 0 && /[\wåäöÅÄÖ\-\.]/.test(text[start-1])) start--;
                while (end < text.length && /[\wåäöÅÄÖ\-\.]/.test(text[end])) end++;
                const newText = text.substring(0, start) + phrase + text.substring(end);
                textarea.value = newText;
                // Colocar cursor al final de la frase insertada
                textarea.selectionStart = textarea.selectionEnd = start + phrase.length;
                textarea.focus();
                addToLastUsed(phrase);
                removeSuggestionBox();
                // Disparar evento input para actualizar cualquier otra lógica
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            });
            box.appendChild(div);
        });
        document.body.appendChild(box);
        currentSuggestionBox = box;

        // Cerrar al hacer clic fuera
        const closeHandler = (e) => {
            if (!box.contains(e.target) && e.target !== textarea) {
                removeSuggestionBox();
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 0);
    }

    function removeSuggestionBox() {
        if (currentSuggestionBox) {
            currentSuggestionBox.remove();
            currentSuggestionBox = null;
        }
    }

    // Evento principal: al escribir en el textarea, mostrar sugerencias
    function attachAutocomplete(textarea) {
        if (!textarea) return;
        textarea.addEventListener('input', function(e) {
            const cursorPos = this.selectionStart;
            const suggestions = getSuggestions(this.value, cursorPos);
            showSuggestions(this, suggestions);
        });
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') removeSuggestionBox();
        });
        textarea.addEventListener('blur', function() {
            // Pequeño retraso para permitir clic en sugerencia
            setTimeout(() => removeSuggestionBox(), 200);
        });
    }

    // Inicializar para ambos textarea (nuevo registro y edición)
    function init() {
        loadNotesDatabase().then(() => {
            const notesField = document.getElementById('notes');
            const editNotesField = document.getElementById('edit-notes');
            if (notesField) attachAutocomplete(notesField);
            if (editNotesField) attachAutocomplete(editNotesField);
            // También observar si el modal de edición se abre dinámicamente (por si el campo se crea tarde)
            const observer = new MutationObserver(() => {
                const newEditNotes = document.getElementById('edit-notes');
                if (newEditNotes && !newEditNotes.hasAttribute('data-autocomplete')) {
                    attachAutocomplete(newEditNotes);
                    newEditNotes.setAttribute('data-autocomplete', 'true');
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();