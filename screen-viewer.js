// ============================================================
// screen-viewer.js - Visor de informes en pantalla
// Con búsqueda en vivo + resaltado + ámbito de búsqueda:
//   - "Egna anteckningar" (por defecto): solo texto del usuario
//   - "Alla kolumner": busca en todas las columnas
// ============================================================

(function () {
    'use strict';

    const log = (...a) => console.log('🖥️ screen-viewer.js:', ...a);

    let viewerEl = null;
    let currentRecords = [];
    let currentStart = '';
    let currentEnd = '';
    let currentZoom = 1;

    // Ámbito de búsqueda: 'user' (por defecto) o 'all'
    let searchScope = 'user';

    // Columnas que pertenecen al usuario (buscables en modo 'user')
    // 0-indexed: 0=Datum, 1=Dag, 2=Från, 3=Till, 4=Rast, 5=Timmar, 6=Projekt, 7=Beskrivning
    const USER_COLUMNS = [0, 2, 3, 6, 7];  // fecha, start, end, proyecto, notas+kollegor

    // ----------------------------------------------------------
    function openViewer(records, startDate, endDate) {
        currentRecords = records || [];
        currentStart = startDate || '';
        currentEnd = endDate || '';
        currentZoom = 1;
        buildViewerUI();
        renderRows();
    }

    // ----------------------------------------------------------
    function buildViewerUI() {
        if (viewerEl) viewerEl.remove();

        viewerEl = document.createElement('div');
        viewerEl.id = 'screen-viewer-overlay';
        viewerEl.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: white;
            width: 100%; max-width: 1400px;
            height: 100%; max-height: 95vh;
            border-radius: 14px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            display: flex; flex-direction: column;
            overflow: hidden;
        `;

        // === Header ===
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 14px 22px;
            background: linear-gradient(135deg, #1e4094 0%, #2563eb 100%);
            color: white;
            display: flex; justify-content: space-between; align-items: center;
            flex-shrink: 0;
        `;
        header.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <i class="fas fa-eye" style="font-size:18px;"></i>
                <h2 style="font-size:17px;font-weight:700;margin:0;">Förhandsgranskning — Arbetstidsrapport</h2>
                <span id="sv-record-count" style="font-size:12px;background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:12px;">0 poster</span>
            </div>
            <div style="display:flex;gap:8px;">
                <button id="sv-print-real" title="Skriv ut / Spara som PDF" style="
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white; padding: 8px 14px;
                    border-radius: 8px; font-size: 13px; font-weight: 500;
                    cursor: pointer; display: flex; align-items: center; gap: 6px;
                "><i class="fas fa-print"></i> Skriv ut</button>
                <button id="sv-close" title="Stäng (Esc)" style="
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white; width: 36px; height: 36px;
                    border-radius: 8px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px;
                "><i class="fas fa-times"></i></button>
            </div>
        `;

        // === Toolbar ===
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            padding: 12px 22px;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
            flex-shrink: 0;
        `;
        toolbar.innerHTML = `
            <div style="display:flex;gap:8px;align-items:center;">
                <label style="font-size:11px;color:#6b7280;font-weight:600;">Sök i:</label>
                <select id="sv-scope" style="
                    padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;
                    font-size:12px;background:white;cursor:pointer;color:#374151;font-weight:500;
                ">
                    <option value="user" selected>✍️ Egna anteckningar</option>
                    <option value="all">🔍 Alla kolumner</option>
                </select>
            </div>
            <div style="flex:1;min-width:220px;position:relative;">
                <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:13px;"></i>
                <input type="text" id="sv-search" placeholder="Sök i egna anteckningar, kollegor..."
                       style="width:100%;padding:8px 12px 8px 34px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;outline:none;">
                <span id="sv-match-count" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;color:#6b7280;background:#f3f4f6;padding:2px 8px;border-radius:10px;display:none;"></span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;font-size:12px;color:#4b5563;">
                <label>Från</label>
                <input type="date" id="sv-date-from" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;">
                <label>Till</label>
                <input type="date" id="sv-date-to" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;">
                <button id="sv-clear-filters" title="Rensa filter" style="
                    background:transparent;border:1px solid #d1d5db;color:#6b7280;
                    width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:12px;
                "><i class="fas fa-undo"></i></button>
            </div>
            <div style="display:flex;gap:4px;align-items:center;background:white;border:1px solid #d1d5db;border-radius:8px;padding:2px;">
                <button id="sv-zoom-out" title="Zoom ut" style="background:transparent;border:none;width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:14px;"><i class="fas fa-search-minus"></i></button>
                <span id="sv-zoom-label" style="min-width:48px;text-align:center;font-size:12px;font-weight:600;color:#374151;">100%</span>
                <button id="sv-zoom-in" title="Zoom in" style="background:transparent;border:none;width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:14px;"><i class="fas fa-search-plus"></i></button>
                <button id="sv-zoom-reset" title="Återställ zoom" style="background:transparent;border:none;width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:12px;color:#6b7280;"><i class="fas fa-compress"></i></button>
            </div>
        `;

        const content = document.createElement('div');
        content.id = 'sv-content';
        content.style.cssText = `
            flex: 1; overflow: auto;
            background: #e5e7eb;
            padding: 20px;
        `;

        const hint = document.createElement('div');
        hint.style.cssText = `
            padding: 8px 22px;
            background: #eff6ff;
            border-top: 1px solid #dbeafe;
            color: #1e40af;
            font-size: 12px; text-align: center;
            flex-shrink: 0;
        `;
        hint.innerHTML = `
            <i class="fas fa-mouse" style="margin-right:6px;"></i>
            Rulla för att bläddra ·
            <kbd style="background:white;padding:1px 5px;border-radius:4px;border:1px solid #bfdbfe;">Ctrl</kbd> + rulla för zoom ·
            <kbd style="background:white;padding:1px 5px;border-radius:4px;border:1px solid #bfdbfe;">Esc</kbd> för att stänga
        `;

        panel.appendChild(header);
        panel.appendChild(toolbar);
        panel.appendChild(content);
        panel.appendChild(hint);
        viewerEl.appendChild(panel);
        document.body.appendChild(viewerEl);

        // ---- Listeners ----
        viewerEl.querySelector('#sv-close').onclick = closeViewer;
        viewerEl.querySelector('#sv-print-real').onclick = doRealPrint;

        const searchInput = viewerEl.querySelector('#sv-search');
        searchInput.addEventListener('input', applyFilters);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                searchInput.value = '';
                applyFilters();
            }
        });

        // Selector de ámbito
        const scopeSelect = viewerEl.querySelector('#sv-scope');
        scopeSelect.addEventListener('change', () => {
            searchScope = scopeSelect.value;
            // Actualizar placeholder para reflejar el ámbito
            searchInput.placeholder = (searchScope === 'user')
                ? 'Sök i egna anteckningar, kollegor...'
                : 'Sök i alla kolumner (datum, timmar, projekt...)';
            applyFilters();
        });

        viewerEl.querySelector('#sv-date-from').addEventListener('change', applyFilters);
        viewerEl.querySelector('#sv-date-to').addEventListener('change', applyFilters);
        viewerEl.querySelector('#sv-clear-filters').addEventListener('click', () => {
            viewerEl.querySelector('#sv-search').value = '';
            viewerEl.querySelector('#sv-date-from').value = '';
            viewerEl.querySelector('#sv-date-to').value = '';
            applyFilters();
        });

        viewerEl.querySelector('#sv-zoom-in').onclick = () => setZoom(currentZoom + 0.1);
        viewerEl.querySelector('#sv-zoom-out').onclick = () => setZoom(currentZoom - 0.1);
        viewerEl.querySelector('#sv-zoom-reset').onclick = () => setZoom(1);

        content.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setZoom(currentZoom + (e.deltaY < 0 ? 0.1 : -0.1));
            }
        }, { passive: false });

        document.addEventListener('keydown', escHandler);

        viewerEl.addEventListener('click', (e) => {
            if (e.target === viewerEl) closeViewer();
        });
    }

    function escHandler(e) {
        const active = document.activeElement;
        if (e.key === 'Escape' && active && active.id === 'sv-search' && active.value) {
            return;
        }
        if (e.key === 'Escape' && viewerEl) {
            e.preventDefault();
            e.stopPropagation();
            closeViewer();
        }
    }

    function closeViewer() {
        if (viewerEl) {
            viewerEl.remove();
            viewerEl = null;
            document.removeEventListener('keydown', escHandler);
        }
    }

    // ----------------------------------------------------------
    function renderRows() {
        const content = viewerEl.querySelector('#sv-content');
        content.innerHTML = '';

        let cs = {}, user = {};
        try {
            if (typeof state !== 'undefined') {
                cs = state.companySettings || {};
                user = state.user || {};
            }
        } catch (e) {}

        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Användare';

        const doc = document.createElement('div');
        doc.id = 'sv-doc';
        doc.style.cssText = `
            background: white;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 50px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-radius: 4px;
            font-size: 12px;
            color: #1f2937;
            zoom: 1;
        `;

        const headerHtml = `
            <div style="border-bottom:2px solid #1e4094;padding-bottom:14px;margin-bottom:20px;">
                <div style="font-size:15px;font-weight:700;color:#1e4094;margin-bottom:4px;">${escapeHtml(cs.name || 'Exempel AB')}</div>
                <div style="font-size:10px;color:#6b7280;line-height:1.5;">
                    ${escapeHtml(cs.address || '')}<br>
                    ${escapeHtml(cs.postal || '')} · Tel: ${escapeHtml(cs.phone || '')}<br>
                    Org.nr: ${escapeHtml(cs.orgnr || '')}
                </div>
            </div>
            <h1 style="text-align:center;color:#1e4094;font-size:20px;margin:10px 0 18px;">ARBETSRAPPORT</h1>
            <div style="background:#f3f4f6;padding:12px 16px;border-radius:8px;margin-bottom:18px;font-size:11px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    <div><strong style="color:#1e4094;">Mätningsingenjör:</strong> ${escapeHtml(userName)}</div>
                    <div><strong style="color:#1e4094;">Period:</strong> ${formatDateShort(currentStart)} – ${formatDateShort(currentEnd)}</div>
                    <div><strong style="color:#1e4094;">Genererad:</strong> ${new Date().toLocaleDateString('sv-SE')}</div>
                    <div><strong style="color:#1e4094;">Antal poster:</strong> <span id="sv-doc-count">${currentRecords.length}</span></div>
                </div>
            </div>
        `;

        const tableHtml = `
            <table id="sv-table" style="width:100%;border-collapse:collapse;font-size:10.5px;">
                <thead>
                    <tr style="background:#1e4094;color:white;">
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:left;">Datum</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:left;">Dag</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:left;">Från</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:left;">Till</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:right;">Rast (h)</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:right;">Timmar</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:left;">Projekt</th>
                        <th style="padding:8px 6px;border:1px solid #1e4094;text-align:left;">Beskrivning</th>
                    </tr>
                </thead>
                <tbody id="sv-tbody"></tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" style="text-align:right;padding:10px 6px;font-weight:700;border-top:2px solid #1e4094;">TOTALT ARBETADE TIMMAR:</td>
                        <td id="sv-total-hours" style="text-align:right;padding:10px 6px;font-weight:700;color:#1e4094;border-top:2px solid #1e4094;">0.00</td>
                        <td colspan="2" style="border-top:2px solid #1e4094;"></td>
                    </tr>
                </tfoot>
            </table>
        `;

        doc.innerHTML = headerHtml + tableHtml;
        content.appendChild(doc);

        const tbody = doc.querySelector('#sv-tbody');
        currentRecords.forEach(([id, record]) => {
            let project = { name: 'Okänd', code: '?' };
            try {
                if (typeof state !== 'undefined' && state.projects && state.projects[record.projectId]) {
                    project = state.projects[record.projectId];
                }
            } catch (e) {}

            const date = new Date(record.date);
            const dateStr = formatDateShort(record.date);
            const dayName = getSwedishDayName(date);
            const [sh, sm] = record.startTime.split(':').map(Number);
            const [eh, em] = record.endTime.split(':').map(Number);
            const workedMinutes = (eh * 60 + em) - (sh * 60 + sm) - record.breakTime;
            const workedHours = workedMinutes / 60;

            const tr = document.createElement('tr');
            tr.dataset.date = record.date;
            tr.style.cssText = 'border-bottom:1px solid #e5e7eb;';
            tr.innerHTML = `
                <td style="padding:6px;border:1px solid #e5e7eb;">${dateStr}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${dayName}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${record.startTime}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${record.endTime}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;">${(record.breakTime / 60).toFixed(2)}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;text-align:right;" data-hours="${workedHours}">${workedHours.toFixed(2)}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">${escapeHtml(project.code)} - ${escapeHtml(project.name)}</td>
                <td style="padding:6px;border:1px solid #e5e7eb;">
                    ${escapeHtml(record.notes || '')}
                    ${record.coworkers ? `<div style="font-size:9px;color:#6b7280;margin-top:2px;"><i class="fas fa-users"></i> ${escapeHtml(record.coworkers)}</div>` : ''}
                </td>
            `;

            // Guardar HTML original de cada celda, marcando su índice de columna
            tr.querySelectorAll('td').forEach((td, idx) => {
                td.dataset.colIndex = idx;
                td.dataset.originalHtml = td.innerHTML;
            });

            tbody.appendChild(tr);
        });

        viewerEl.querySelector('#sv-record-count').textContent = `${currentRecords.length} poster`;
        applyFilters();
    }

    // ----------------------------------------------------------
    // Filtros + RESALTADO con ámbito
    // ----------------------------------------------------------
    function applyFilters() {
        if (!viewerEl) return;
        const q = (viewerEl.querySelector('#sv-search').value || '').trim();
        const qLower = q.toLowerCase();
        const from = viewerEl.querySelector('#sv-date-from').value;
        const to = viewerEl.querySelector('#sv-date-to').value;

        const rows = viewerEl.querySelectorAll('#sv-tbody tr');
        let visible = 0;
        let visibleHours = 0;
        let matchCount = 0;
        let recordMatches = 0;

        rows.forEach(tr => {
            const rowDate = tr.dataset.date;

            // 1) Filtro por fecha
            let dateOk = true;
            if (from && rowDate < from) dateOk = false;
            if (to && rowDate > to) dateOk = false;

            // 2) Filtro por texto según ámbito
            let textOk = true;
            if (qLower && dateOk) {
                const cells = tr.querySelectorAll('td');
                let matched = false;
                cells.forEach(td => {
                    const colIdx = parseInt(td.dataset.colIndex, 10);
                    // En modo "user" solo se buscan columnas del usuario
                    if (searchScope === 'user' && !USER_COLUMNS.includes(colIdx)) return;

                    const raw = (td.dataset.originalHtml || '').replace(/<[^>]*>/g, ' ');
                    if (raw.toLowerCase().includes(qLower)) {
                        matched = true;
                    }
                });
                textOk = matched;
            }

            const ok = dateOk && textOk;

            if (ok) {
                tr.style.display = '';
                visible++;
                const h = parseFloat(tr.querySelector('td[data-hours]')?.dataset.hours || '0');
                if (!isNaN(h)) visibleHours += h;

                // Resaltado según ámbito
                if (q) {
                    let rowMatches = 0;
                    tr.querySelectorAll('td').forEach(td => {
                        const colIdx = parseInt(td.dataset.colIndex, 10);
                        if (searchScope === 'user' && !USER_COLUMNS.includes(colIdx)) {
                            // Asegurar que no queden marcas de búsquedas anteriores
                            if (td.dataset.originalHtml !== undefined) {
                                td.innerHTML = td.dataset.originalHtml;
                            }
                            return;
                        }
                        const n = highlightCell(td, q);
                        matchCount += n;
                        rowMatches += n;
                    });
                    if (rowMatches > 0) recordMatches++;
                } else {
                    tr.querySelectorAll('td').forEach(td => {
                        if (td.dataset.originalHtml !== undefined) td.innerHTML = td.dataset.originalHtml;
                    });
                }
            } else {
                tr.style.display = 'none';
            }
        });

        viewerEl.querySelector('#sv-total-hours').textContent = visibleHours.toFixed(2);
        viewerEl.querySelector('#sv-record-count').textContent = `${visible} / ${currentRecords.length} poster`;

        const badge = viewerEl.querySelector('#sv-match-count');
        if (q) {
            badge.style.display = '';
            badge.textContent = matchCount === 0
                ? 'Inga träffar'
                : (matchCount === 1 ? '1 träff' : `${matchCount} träffar`);
            badge.style.background = matchCount === 0 ? '#fee2e2' : '#dbeafe';
            badge.style.color      = matchCount === 0 ? '#991b1b' : '#1e40af';
        } else {
            badge.style.display = 'none';
        }
    }

    // ----------------------------------------------------------
    function highlightCell(td, query) {
        if (td.dataset.originalHtml !== undefined) {
            td.innerHTML = td.dataset.originalHtml;
        }
        if (!query) return 0;

        const safeQuery = escapeRegex(query);
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        let totalMatches = 0;

        const walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT, null);
        const textNodes = [];
        let n;
        while ((n = walker.nextNode())) {
            if (n.nodeValue && regex.test(n.nodeValue)) textNodes.push(n);
            regex.lastIndex = 0;
        }

        textNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let m;
            regex.lastIndex = 0;

            while ((m = regex.exec(text)) !== null) {
                if (m.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
                }
                const mark = document.createElement('mark');
                mark.textContent = m[0];
                mark.style.cssText = `
                    background: #fde047;
                    color: #713f12;
                    padding: 1px 3px;
                    border-radius: 3px;
                    font-weight: 600;
                    box-shadow: 0 0 0 1px #facc15;
                `;
                fragment.appendChild(mark);
                totalMatches++;
                lastIndex = m.index + m[0].length;
                if (m[0].length === 0) regex.lastIndex++;
            }

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }

            textNode.parentNode.replaceChild(fragment, textNode);
        });

        return totalMatches;
    }

    // ----------------------------------------------------------
    function setZoom(z) {
        currentZoom = Math.max(0.3, Math.min(3, z));
        const doc = viewerEl?.querySelector('#sv-doc');
        if (doc) doc.style.zoom = currentZoom;
        const label = viewerEl?.querySelector('#sv-zoom-label');
        if (label) label.textContent = Math.round(currentZoom * 100) + '%';
    }

    // ----------------------------------------------------------
    function doRealPrint() {
        const docEl = document.getElementById('sv-doc');
        if (!docEl) return;
        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) { alert('Tillåt popup-fönster för att skriva ut'); return; }

        const clone = docEl.cloneNode(true);
        clone.querySelectorAll('mark').forEach(m => {
            m.replaceWith(document.createTextNode(m.textContent));
        });

        w.document.write(`
            <!DOCTYPE html><html><head>
            <meta charset="utf-8"><title>Arbetstidsrapport</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin:0; padding:0; color:#1f2937; }
                table { border-collapse: collapse; width: 100%; font-size: 10.5px; }
                th, td { border: 1px solid #e5e7eb; padding: 6px; }
                #sv-doc { padding: 0 !important; box-shadow: none !important; max-width:100% !important; zoom:1 !important; }
            </style>
            </head><body>${clone.outerHTML}</body></html>
        `);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
    }

    // ----------------------------------------------------------
    function formatDateShort(dateString) {
        const d = new Date(dateString);
        const y = d.getFullYear().toString().substring(2);
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    function getSwedishDayName(date) {
        const days = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
        return days[date.getDay()];
    }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        }[c]));
    }
    function escapeRegex(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ----------------------------------------------------------
    function hookGeneratePrint() {
        if (typeof window.generatePrintContent !== 'function') {
            setTimeout(hookGeneratePrint, 500);
            return;
        }
        if (window.generatePrintContent.__svHooked) return;

        const wrapped = function (records, startDate, endDate) {
            log('📄 Interceptado → abriendo visor en pantalla');
            openViewer(records, startDate, endDate);
        };
        wrapped.__svHooked = true;
        window.generatePrintContent = wrapped;
        log('✅ Hook aplicado a generatePrintContent');
    }

    function init() {
        log('Inicializando visor en pantalla...');
        hookGeneratePrint();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 800);
    }

    window.ScreenViewer = { open: openViewer, close: closeViewer };
})();