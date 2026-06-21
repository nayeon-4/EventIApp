/* =====================================================
   EVENTIAPP — DEMO INTERACTIVA — demo.js
   Toda la lógica en memoria (sin backend)
   Cubre HUs: US01-US05, US07-US11, US14-US19,
              US21-US25, US28-US29, US31-US32,
              US34, US40-US42, US45
===================================================== */

'use strict';

/* ===== ESTADO EN MEMORIA ===== */
const state = {
  eventos: [
    { id: 'demo1', nombre: 'Demo Day Lima 2026', fecha: '2026-07-15', objetivo: 'captacion', desc: 'Presentación de startups a inversores ángel y fondos de Lima.', cancelado: false },
    { id: 'demo2', nombre: 'Startup Night Miraflores', fecha: '2026-08-22', objetivo: 'networking', desc: 'Noche de networking para emprendedores y mentores.', cancelado: false }
  ],
  tareas: [],
  gastos: [
    { id: 'g1', categoria: 'Logística', desc: 'Alquiler de sala', monto: 3500 },
    { id: 'g2', categoria: 'Marketing', desc: 'Diseño gráfico', monto: 800 },
    { id: 'g3', categoria: 'Catering', desc: 'Coffee break', monto: 2200 },
    { id: 'g4', categoria: 'Tecnología', desc: 'Streaming HD', monto: 4000 },
    { id: 'g5', categoria: 'Personal', desc: 'Staff del evento', monto: 2000 }
  ],
  ingresos: 15000,
  mensajes: [],
  comparar: [],
  reuniones: []
};

/* ===== UTILIDADES ===== */
function uid() { return '_' + Math.random().toString(36).substr(2, 9); }

function toast(msg, tipo = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.setAttribute('role', 'alert');
  t.innerHTML = `<span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

function formatCurrency(n) {
  return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function cerrarModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
}

/* ===== NAVBAR HAMBURGER ===== */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  // Tabs init
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Formulario de evento
  const eventoForm = document.getElementById('eventoForm');
  if (eventoForm) eventoForm.addEventListener('submit', crearEvento);

  // Formulario de gasto
  const gastoForm = document.getElementById('gastoForm');
  if (gastoForm) gastoForm.addEventListener('submit', registrarGasto);

  // Cierre de modales al hacer clic fuera
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  });

  // Poner fecha mínima de hoy en los inputs de fecha
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(inp => {
    if (!inp.value) inp.min = today;
  });

  actualizarPresupuesto();
});

/* ===== TABS ===== */
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
    b.setAttribute('aria-selected', b.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${tab}`);
  });
  // Scroll al inicio del panel
  document.getElementById('demo-tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ======================================
   MÓDULO 1: GESTIÓN DE EVENTOS
   US01 Crear, US02 Editar, US03 Objetivos,
   US04 Recursos, US05 Público, US07 Cancelar
====================================== */
function crearEvento(e) {
  e.preventDefault();
  let valid = true;

  const nombre = document.getElementById('eventoNombre').value.trim();
  const fecha  = document.getElementById('eventoFecha').value;
  const obj    = document.getElementById('eventoObjetivo').value;

  // Validaciones
  document.getElementById('err-nombre').textContent = '';
  document.getElementById('err-fecha').textContent  = '';
  document.getElementById('err-objetivo').textContent = '';

  if (!nombre) {
    document.getElementById('err-nombre').textContent = 'El nombre del evento es obligatorio.';
    valid = false;
  }
  if (!fecha) {
    document.getElementById('err-fecha').textContent = 'Selecciona una fecha válida.';
    valid = false;
  }
  if (!obj) {
    document.getElementById('err-objetivo').textContent = 'Selecciona un objetivo principal.';
    valid = false;
  }
  if (!valid) return;

  const publicoChecked = [...document.querySelectorAll('.checkbox-group input:checked')].map(i => i.value);
  const recursosChecked = [...document.querySelectorAll('.recursos-grid input:checked')].map(i => i.value);
  const desc = document.getElementById('eventoDesc').value.trim();

  const evento = {
    id: uid(),
    nombre,
    fecha,
    objetivo: obj,
    desc,
    publico: publicoChecked,
    recursos: recursosChecked,
    cancelado: false
  };

  state.eventos.push(evento);
  renderEventosList();
  e.target.reset();
  toast(`✅ Evento "${nombre}" creado correctamente.`, 'success');
}

// US02 — Editar evento
let editandoId = null;
function editarEvento(id) {
  const ev = state.eventos.find(e => e.id === id);
  if (!ev) return;
  editandoId = id;
  document.getElementById('editNombre').value = ev.nombre;
  document.getElementById('editFecha').value  = ev.fecha;
  document.getElementById('editDesc').value   = ev.desc || '';
  document.getElementById('editModal').style.display = 'flex';
  document.getElementById('editNombre').focus();
}

function guardarEdicion() {
  if (!editandoId) return;
  const ev = state.eventos.find(e => e.id === editandoId);
  if (!ev) return;
  const nuevoNombre = document.getElementById('editNombre').value.trim();
  if (!nuevoNombre) { toast('El nombre no puede estar vacío.', 'error'); return; }
  ev.nombre = nuevoNombre;
  ev.fecha  = document.getElementById('editFecha').value;
  ev.desc   = document.getElementById('editDesc').value.trim();
  renderEventosList();
  cerrarModal('editModal');
  editandoId = null;
  toast('✏️ Evento actualizado correctamente.', 'success');
}

// US07 — Cancelar evento
function cancelarEvento(id) {
  const ev = state.eventos.find(e => e.id === id);
  if (!ev || ev.cancelado) return;
  if (!confirm(`¿Seguro que deseas cancelar el evento "${ev.nombre}"?\nEsta acción no se puede deshacer.`)) return;
  ev.cancelado = true;
  renderEventosList();
  toast(`❌ Evento "${ev.nombre}" cancelado.`, 'warning');
}

function renderEventosList() {
  const container = document.getElementById('eventosList');
  const empty     = document.getElementById('emptyEvents');
  if (!container) return;

  const activos = state.eventos.filter(e => !e.cancelado);
  const cancelados = state.eventos.filter(e => e.cancelado);

  if (state.eventos.length === 0) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  container.innerHTML = '';

  [...activos, ...cancelados].forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event-item';
    div.dataset.id = ev.id;
    const fechaFmt = ev.fecha ? new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    div.innerHTML = `
      <div class="event-item-info">
        <span class="event-status ${ev.cancelado ? 'cancelled' : 'active'}" aria-label="Estado: ${ev.cancelado ? 'cancelado' : 'activo'}">${ev.cancelado ? 'Cancelado' : 'Activo'}</span>
        <strong>${ev.nombre}</strong>
        <span class="event-date">📅 ${fechaFmt} · ${ev.objetivo || 'Sin objetivo'}</span>
      </div>
      ${!ev.cancelado ? `
      <div class="event-item-actions">
        <button class="btn-icon" aria-label="Editar evento ${ev.nombre}" onclick="editarEvento('${ev.id}')">✏️ Editar</button>
        <button class="btn-icon danger" aria-label="Cancelar evento ${ev.nombre}" onclick="cancelarEvento('${ev.id}')">❌ Cancelar</button>
      </div>` : ''}
    `;
    container.appendChild(div);
  });
}

/* ======================================
   MÓDULO 2: CHECKLIST
   US08 Ver, US09 Registrar, US10 Asignar,
   US11 Alertas, US14 Cronograma
====================================== */
let tareaIdCounter = 10;

function agregarTarea() {
  const input    = document.getElementById('nuevaTarea');
  const asignado = document.getElementById('asignadoA');
  const fechaInp = document.getElementById('fechaTarea');
  const texto    = input.value.trim();
  if (!texto) { toast('Escribe el nombre de la tarea primero.', 'error'); input.focus(); return; }

  const tarea = {
    id: 't' + (++tareaIdCounter),
    texto,
    asignado: asignado.value || 'Sin asignar',
    fecha: fechaInp.value,
    completada: false
  };
  state.tareas.push(tarea);
  renderTarea(tarea);
  input.value = '';
  asignado.value = '';
  fechaInp.value = '';
  actualizarResumenTareas();
  toast(`✅ Tarea "${texto}" agregada.`, 'success');
}

function renderTarea(tarea) {
  const container = document.getElementById('checklistContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'task-item';
  div.dataset.id = tarea.id;
  const fechaDisplay = tarea.fecha
    ? `📅 ${new Date(tarea.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`
    : '';
  const hoy = new Date().toISOString().split('T')[0];
  const esUrgente = tarea.fecha && tarea.fecha <= new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  div.innerHTML = `
    <input type="checkbox" id="ck-${tarea.id}" ${tarea.completada ? 'checked' : ''} aria-label="Marcar tarea: ${tarea.texto}" onchange="toggleTarea('${tarea.id}', this)">
    <label for="ck-${tarea.id}" class="task-label">${tarea.texto}</label>
    <span class="task-assignee">👤 ${tarea.asignado}</span>
    ${tarea.fecha ? `<span class="task-date ${esUrgente ? 'warn' : ''}">${esUrgente ? '⚠️' : ''} ${fechaDisplay}</span>` : ''}
    <button class="btn-icon danger small" aria-label="Eliminar tarea ${tarea.texto}" onclick="eliminarTarea('${tarea.id}')">🗑️</button>
  `;
  container.appendChild(div);
}

function toggleTarea(id, checkbox) {
  // Marcar tareas precargadas también
  const div = checkbox.closest('.task-item');
  if (div) div.classList.toggle('completed', checkbox.checked);
  const tarea = state.tareas.find(t => t.id === id);
  if (tarea) tarea.completada = checkbox.checked;
  actualizarResumenTareas();
}

function eliminarTarea(id) {
  const div = document.querySelector(`.task-item[data-id="${id}"]`);
  if (div) { div.style.animation = 'fadeIn 0.2s ease reverse'; setTimeout(() => div.remove(), 200); }
  state.tareas = state.tareas.filter(t => t.id !== id);
  actualizarResumenTareas();
}

function actualizarResumenTareas() {
  const todos = document.querySelectorAll('.task-item');
  const completadas = document.querySelectorAll('.task-item input[type="checkbox"]:checked');
  const pendientes = todos.length - completadas.length;
  const resumen = document.getElementById('tareasResumen');
  if (resumen) resumen.textContent = `${pendientes} pendiente${pendientes !== 1 ? 's' : ''} · ${completadas.length} completada${completadas.length !== 1 ? 's' : ''}`;
}

// US11 — Alerta de tareas
function simularAlertaTareas() {
  const tareasUrgentes = document.querySelectorAll('.task-date.warn');
  if (tareasUrgentes.length > 0) {
    toast(`⚠️ ${tareasUrgentes.length} tarea(s) vencen pronto. Revisa el checklist.`, 'warning');
  } else {
    toast('✅ Todas las tareas están dentro del plazo.', 'success');
  }
}

/* ======================================
   MÓDULO 3: PRESUPUESTO
   US15 Gastos, US16 Presupuesto dinámico,
   US17 Alerta, US18 ROI, US19 Reporte, US21 Comparar
====================================== */
let gastosIdCounter = 10;

function registrarGasto(e) {
  e.preventDefault();
  const monto = parseFloat(document.getElementById('gastoMonto').value);
  document.getElementById('err-monto').textContent = '';
  if (!monto || monto <= 0) {
    document.getElementById('err-monto').textContent = 'Ingresa un monto válido mayor a 0.';
    return;
  }
  const categoria = document.getElementById('gastoCategoria').value;
  const desc      = document.getElementById('gastoDescripcion').value.trim() || categoria;
  const gasto = { id: 'g' + (++gastosIdCounter), categoria, desc, monto };
  state.gastos.push(gasto);

  const tbody = document.getElementById('gastosTableBody');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.dataset.id = gasto.id;
    tr.innerHTML = `<td>${categoria}</td><td>${desc}</td><td>${formatCurrency(monto)}</td><td><button class="btn-icon danger small" aria-label="Eliminar gasto ${desc}" onclick="eliminarGasto('${gasto.id}', this)">🗑️</button></td>`;
    tbody.appendChild(tr);
  }
  actualizarPresupuesto();
  e.target.reset();
  toast(`💰 Gasto de ${formatCurrency(monto)} registrado.`, 'success');
}

function eliminarGasto(id, btn) {
  state.gastos = state.gastos.filter(g => g.id !== id);
  const tr = btn?.closest('tr');
  if (tr) tr.remove();
  actualizarPresupuesto();
  toast('Gasto eliminado.', 'info');
}

function actualizarPresupuesto() {
  const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0);
  const balance     = state.ingresos - totalGastos;
  const roi         = state.ingresos > 0 ? Math.round(((state.ingresos - totalGastos) / (totalGastos || 1)) * 100) : 0;
  const pctGastos   = Math.min(Math.round((totalGastos / state.ingresos) * 100), 100);

  // Actualizar cards
  const elGastos  = document.getElementById('totalGastos');
  const elROI     = document.getElementById('roiValor');
  const elBalance = document.getElementById('balanceValor');
  const elEstado  = document.getElementById('balanceEstado');
  const elCard    = document.getElementById('balanceCard');

  if (elGastos)  elGastos.textContent  = formatCurrency(totalGastos);
  if (elROI)     elROI.textContent     = roi + '%';
  if (elBalance) elBalance.textContent = formatCurrency(Math.abs(balance));
  if (elEstado && elCard) {
    if (balance >= 0) {
      elEstado.textContent = '✅ Dentro del presupuesto';
      elCard.style.background = 'var(--blue-light)';
    } else {
      elEstado.textContent = '❌ Presupuesto excedido';
      elCard.style.background = '#fdeaea';
    }
  }

  // Actualizar barra
  const gastoBar      = document.getElementById('gastoBar');
  const gastoBarLabel = document.getElementById('gastoBarLabel');
  if (gastoBar) { gastoBar.style.width = pctGastos + '%'; gastoBar.setAttribute('aria-valuenow', pctGastos); }
  if (gastoBarLabel) gastoBarLabel.textContent = formatCurrency(totalGastos);

  // US17 Alerta sobrecosto
  const alerta = document.getElementById('alertSobrecosto');
  if (alerta) {
    const limite = parseFloat(document.getElementById('limitPresupuesto')?.value) || 13000;
    alerta.style.display = totalGastos > limite ? 'block' : 'none';
  }
}

// US17 — Verificar límite manual
function verificarLimite() {
  const limite = parseFloat(document.getElementById('limitPresupuesto').value) || 0;
  const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0);
  const alerta = document.getElementById('alertSobrecosto');
  if (totalGastos > limite) {
    if (alerta) alerta.style.display = 'block';
    toast(`⚠️ Los gastos (${formatCurrency(totalGastos)}) superan el límite de ${formatCurrency(limite)}.`, 'warning');
  } else {
    if (alerta) alerta.style.display = 'none';
    toast(`✅ Gastos dentro del límite de ${formatCurrency(limite)}.`, 'success');
  }
}

// US19 — Generar reporte financiero
function generarReporte() {
  const btn = document.getElementById('btnReporte');
  const output = document.getElementById('reporteOutput');
  if (!btn || !output) return;
  btn.textContent = '⏳ Generando reporte...';
  btn.disabled = true;
  setTimeout(() => {
    const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0);
    const balance = state.ingresos - totalGastos;
    const roi = Math.round(((state.ingresos - totalGastos) / (totalGastos || 1)) * 100);
    const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
    output.style.display = 'block';
    output.innerHTML = `
      <strong>📄 Reporte Financiero — EventIApp</strong><br>
      <strong>Evento:</strong> Demo Day Lima 2026<br>
      <strong>Fecha de generación:</strong> ${fecha}<br>
      <hr style="border:none;border-top:1px solid var(--gray-mid);margin:8px 0">
      <strong>Ingresos totales:</strong> ${formatCurrency(state.ingresos)}<br>
      <strong>Gastos totales:</strong> ${formatCurrency(totalGastos)}<br>
      <strong>Balance:</strong> ${formatCurrency(balance)} ${balance >= 0 ? '✅' : '❌'}<br>
      <strong>ROI:</strong> ${roi}%<br>
      <strong>Partidas de gasto:</strong> ${state.gastos.length}<br>
      <hr style="border:none;border-top:1px solid var(--gray-mid);margin:8px 0">
      <em>Reporte generado automáticamente por EventIApp. Para exportar en PDF, contacta a soporte.</em>
    `;
    btn.textContent = '📄 Generar reporte';
    btn.disabled = false;
    toast('📄 Reporte financiero generado.', 'success');
  }, 1800);
}

/* ======================================
   MÓDULO 4: MÉTRICAS
   US22 Dashboard, US23 Asistencia,
   US24 ROI post-evento, US25 Gráficos
====================================== */
function actualizarAsistencia(val) {
  const pct = parseInt(val);
  const bar = document.getElementById('asistenciaBar');
  const num = document.getElementById('asistenciaPct');
  const sliderVal = document.getElementById('sliderVal');
  if (bar) { bar.style.width = pct + '%'; bar.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', pct); }
  if (num) num.textContent = pct + '%';
  if (sliderVal) sliderVal.textContent = pct + '%';
}

function calcularROI() {
  const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0);
  const roi = Math.round(((state.ingresos - totalGastos) / (totalGastos || 1)) * 100);
  toast(`📊 ROI recalculado: ${roi}% (${formatCurrency(state.ingresos - totalGastos)} de ganancia)`, 'success');
}

/* ======================================
   MÓDULO 5: EXPLORAR STARTUPS / MATCHMAKING
   US28 Evaluar, US29 Filtrar, US31 Favoritos,
   US32 Recomendación IA, US34 Comparar
====================================== */
// US29 — Filtrar por sector
function filtrarSector(sector) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.sector === sector));
  document.querySelectorAll('.startup-card').forEach(card => {
    if (sector === 'todos' || card.dataset.sector === sector) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// US31 — Marcar favorito
function toggleFavorito(btn) {
  const esFav = btn.textContent === '★';
  btn.textContent = esFav ? '☆' : '★';
  btn.classList.toggle('active', !esFav);
  const nombre = btn.closest('.startup-card')?.querySelector('strong')?.textContent || 'Startup';
  toast(esFav ? `☆ ${nombre} eliminada de favoritos.` : `⭐ ${nombre} agregada a favoritos.`, 'info');
}

// US32 — Recomendación IA
const recomendacionesIA = [
  { nombre: 'SaludBot', razon: 'Alta compatibilidad con tu perfil inversor en healthtech. ROI estimado 45%, sector con alto crecimiento post-pandemia.' },
  { nombre: 'RouteX', razon: 'Modelo validado con 3 clientes enterprise. Potencial de escalado regional en 12 meses.' },
  { nombre: 'PagoYa', razon: 'Sector fintech con alta demanda en LatAm. Equipo técnico sólido y tracción comprobable.' }
];

function simularRecomendacionIA() {
  const btn = document.getElementById('btnIA');
  const output = document.getElementById('iaOutput');
  if (!btn || !output) return;
  btn.textContent = '⏳ Analizando perfil...';
  btn.disabled = true;
  setTimeout(() => {
    const html = `
      <strong>🤖 Recomendaciones personalizadas para tu perfil:</strong><br><br>
      ${recomendacionesIA.map((r, i) => `<strong>${i + 1}. ${r.nombre}</strong> — ${r.razon}`).join('<br><br>')}
      <br><br><em>Basado en tu historial de eventos, sector de interés y retorno esperado. Actualizado en tiempo real.</em>
    `;
    output.style.display = 'block';
    output.innerHTML = html;
    btn.textContent = '✨ Ver sugerencias IA';
    btn.disabled = false;
    toast('🤖 Recomendaciones IA generadas para tu perfil.', 'success');
  }, 2000);
}

// US34 — Comparar proyectos
let seleccionadas = [];
function seleccionarComparar(nombre, roi, monto, etapa) {
  const existe = seleccionadas.find(s => s.nombre === nombre);
  if (existe) { toast(`${nombre} ya está en la comparación.`, 'info'); return; }
  if (seleccionadas.length >= 3) { toast('Puedes comparar hasta 3 startups a la vez.', 'warning'); return; }
  seleccionadas.push({ nombre, roi, monto, etapa });
  toast(`📊 ${nombre} agregada a la comparación.`, 'info');
  renderComparar();
}

function renderComparar() {
  const section = document.getElementById('compararSection');
  const content = document.getElementById('compararContent');
  if (!section || !content || seleccionadas.length === 0) return;
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const mejorROI = Math.max(...seleccionadas.map(s => s.roi));

  let html = `<div style="overflow-x:auto">
    <table class="comparar-table" aria-label="Comparación de startups seleccionadas">
      <thead><tr>
        <th scope="col">Criterio</th>
        ${seleccionadas.map(s => `<th scope="col">${s.nombre}</th>`).join('')}
      </tr></thead>
      <tbody>
        <tr><td><strong>ROI estimado</strong></td>${seleccionadas.map(s => `<td class="${s.roi === mejorROI ? 'highlight' : ''}">${s.roi}% ${s.roi === mejorROI ? '🏆' : ''}</td>`).join('')}</tr>
        <tr><td><strong>Capital buscado</strong></td>${seleccionadas.map(s => `<td>${formatCurrency(s.monto)}</td>`).join('')}</tr>
        <tr><td><strong>Etapa</strong></td>${seleccionadas.map(s => `<td>${s.etapa}</td>`).join('')}</tr>
        <tr><td><strong>Riesgo estimado</strong></td>${seleccionadas.map(s => `<td>${s.etapa === 'Pre-seed' ? '🔴 Alto' : s.etapa === 'Seed' ? '🟡 Medio' : '🟢 Bajo'}</td>`).join('')}</tr>
      </tbody>
    </table>
  </div>
  <div style="margin-top:1rem;display:flex;gap:0.75rem;flex-wrap:wrap">
    <button class="btn-secondary small" onclick="seleccionadas=[];renderComparar();document.getElementById('compararSection').style.display='none'">Limpiar comparación</button>
  </div>`;
  content.innerHTML = html;
}

function contactarStartup(nombre) {
  toast(`💬 Iniciando chat con ${nombre}... Ve a la pestaña Chat y Reuniones.`, 'info');
}

/* ======================================
   MÓDULO 6: CHAT Y REUNIONES
   US40 Agendar, US41 Invitaciones,
   US42 Chat interno, US45 Cifrado
====================================== */
// US42 — Chat en memoria
function enviarMensaje() {
  const input = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');
  if (!input || !chatWindow) return;
  const texto = input.value.trim();
  if (!texto) return;

  const contacto = document.getElementById('chatContacto')?.value || 'Contacto';
  const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  // Mensaje enviado
  const msgEnviado = document.createElement('div');
  msgEnviado.className = 'chat-msg sent';
  msgEnviado.innerHTML = `<div class="msg-bubble"><p>${escapeHtml(texto)}</p><span class="msg-time">${hora}</span></div>`;
  chatWindow.appendChild(msgEnviado);

  input.value = '';
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // US42 — Simular respuesta del contacto
  setTimeout(() => {
    const respuestas = [
      '¡Interesante! ¿Podrías contarme más sobre las métricas de crecimiento?',
      'Perfecto. ¿Cuándo estarías disponible para una reunión esta semana?',
      'Entendido. Voy a revisar el deck de inversión y te confirmo.',
      'Me parece una propuesta sólida. ¿Cuál es el mínimo de inversión?',
      'Gracias por la información. Lo analizaré y te respondo pronto.'
    ];
    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
    const initials = contacto.split(' ').map(p => p[0]).join('').toUpperCase().substr(0, 2);
    const hora2 = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const msgRecibido = document.createElement('div');
    msgRecibido.className = 'chat-msg received';
    msgRecibido.innerHTML = `
      <span class="msg-avatar" aria-hidden="true">${initials}</span>
      <div class="msg-bubble">
        <span class="msg-sender">${escapeHtml(contacto)}</span>
        <p>${respuesta}</p>
        <span class="msg-time">${hora2}</span>
      </div>`;
    chatWindow.appendChild(msgRecibido);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 1200 + Math.random() * 800);
}

// US40 — Agendar reunión
function agendarReunion(e) {
  if (e) e.preventDefault();
  const contacto = document.getElementById('reunionContacto').value;
  const fecha    = document.getElementById('reunionFecha').value;
  const hora     = document.getElementById('reunionHora').value;
  const modelo   = document.getElementById('reunionModelo').value;

  if (!contacto || !fecha || !hora) {
    toast('Completa contacto, fecha y hora para agendar.', 'error');
    return;
  }

  const fechaFmt = new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  const lista = document.getElementById('reunionesList');
  if (lista) {
    const item = document.createElement('div');
    item.className = 'reunion-item';
    item.innerHTML = `
      <span class="reunion-icon" aria-hidden="true">📅</span>
      <div><strong>${contacto.split(' - ')[0]}</strong><span>${fechaFmt} · ${hora} · ${modelo.charAt(0).toUpperCase() + modelo.slice(1)}</span></div>
      <span class="reunion-status confirmed" aria-label="Estado: confirmada">Confirmada</span>
    `;
    lista.appendChild(item);
  }

  document.getElementById('reunionContacto').value = '';
  document.getElementById('reunionFecha').value = '';
  document.getElementById('reunionHora').value = '';
  document.getElementById('reunionNota').value = '';
  toast(`📅 Reunión con ${contacto.split(' - ')[0]} agendada para el ${fechaFmt}.`, 'success');
}

// US41 — Enviar invitación
function enviarInvitacion() {
  const contacto = document.getElementById('reunionContacto').value;
  const fecha    = document.getElementById('reunionFecha').value;
  if (!contacto) { toast('Selecciona un contacto para enviar la invitación.', 'error'); return; }
  toast(`📨 Invitación enviada a ${contacto.split(' - ')[0]}${fecha ? ' para el ' + new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : ''}.`, 'success');
}

/* ===== HELPERS ===== */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Limpiar formulario de evento
document.getElementById('btnLimpiar')?.addEventListener('click', () => {
  document.getElementById('eventoForm')?.reset();
  ['err-nombre','err-fecha','err-objetivo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
});
