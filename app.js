/**
 * CheckDetour - Professional Parachute & Canopy Inspection Component
 * 100% focused on Ram-Air Parachute Inspection (Canopy, Cells, Lines, Slider, Risers)
 */

// Hotspots do Mapa de Linhas - fonte: coordinates.txt (x,y,rótulo)
// IMPORTANTE: as coordenadas de coordinates.txt foram anotadas sobre o desenho
// deitado (girado 90°), em ~50% da escala da imagem, com leve escala
// não-uniforme. O JPEG tem EXIF Orientation 6, então o navegador exibe
// 1600 x 1180 (desenho em pé). A afim abaixo já está composta com essa
// rotação (dispX = 1599 - rawY, dispY = rawX) e projeta cada ponto no
// espaço de exibição, viewBox 1600 x 1180:
//   imgX = A*x + B*y + C
//   imgY = D*x + E*y + F
// (afim bruta calibrada por mínimos quadrados contra os nós do desenho;
// erro <= ~9px)
const ANNOT_TO_IMG = { A: -1.9859, B: 0.0086, C: 1782.8384, D: 0.0369, E: 2.1459, F: -112.7682 };

function mapToImage(x, y) {
  const m = ANNOT_TO_IMG;
  return { x: m.A * x + m.B * y + m.C, y: m.D * x + m.E * y + m.F };
}

// Raio do hotspot em unidades do viewBox da imagem (1600x1180)
const HOTSPOT_RADIUS = 36;

const PARACHUTE_ZONES = [
  { id: "A1", name: "Ponto A1", group: "Mapa de Linhas", x: 193, y: 88, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A2", name: "Ponto A2", group: "Mapa de Linhas", x: 261, y: 84, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A3", name: "Ponto A3", group: "Mapa de Linhas", x: 329, y: 82, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A4", name: "Ponto A4", group: "Mapa de Linhas", x: 491, y: 229, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A5", name: "Ponto A5", group: "Mapa de Linhas", x: 191, y: 166, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A6", name: "Ponto A6", group: "Mapa de Linhas", x: 257, y: 168, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A7", name: "Ponto A7", group: "Mapa de Linhas", x: 331, y: 174, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A8", name: "Ponto A8", group: "Mapa de Linhas", x: 325, y: 131, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A9", name: "Ponto A9", group: "Mapa de Linhas", x: 259, y: 129, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A10", name: "Ponto A10", group: "Mapa de Linhas", x: 193, y: 125, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A11", name: "Ponto A11", group: "Mapa de Linhas", x: 505, y: 334, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A12", name: "Ponto A12", group: "Mapa de Linhas", x: 429, y: 225, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A13", name: "Ponto A13", group: "Mapa de Linhas", x: 364, y: 223, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A14", name: "Ponto A14", group: "Mapa de Linhas", x: 427, y: 147, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A15", name: "Ponto A15", group: "Mapa de Linhas", x: 427, y: 108, status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "A16", name: "Ponto A16", group: "Mapa de Linhas", x: 394, y: 127, status: "ok", damageType: null, severity: "Leve", notes: "" }
];

let activeSelectedZone = null;
let currentModalStatus = "defect";

document.addEventListener("DOMContentLoaded", () => {
  renderZoneMarkers();
  updateCounters();
  updateJsonPayload();
  startClock();
});

function renderZoneMarkers() {
  const group = document.getElementById("zonesGroup");
  if (!group) return;
  group.innerHTML = "";

  PARACHUTE_ZONES.forEach(zone => {
    const p = mapToImage(zone.x, zone.y);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x.toFixed(2));
    circle.setAttribute("cy", p.y.toFixed(2));
    circle.setAttribute("r", HOTSPOT_RADIUS);
    circle.setAttribute("class", `zone-marker state-${zone.status}`);
    circle.setAttribute("id", `mark-${zone.id}`);

    // Tooltip
    circle.addEventListener("mouseenter", () => showTooltip(zone));
    circle.addEventListener("mouseleave", () => hideTooltip());

    // Click
    circle.addEventListener("click", () => handleZoneClick(zone));

    group.appendChild(circle);
  });

  renderDefectsSummaryList();
}

function showTooltip(zone) {
  const tt = document.getElementById("cleanTooltip");
  if (!tt) return;
  const code = document.getElementById("ttZoneCode");
  const name = document.getElementById("ttZoneName");
  const status = document.getElementById("ttZoneStatus");

  code.textContent = zone.id;
  name.textContent = zone.name;

  if (zone.status === "defect") {
    status.textContent = "AVARIA";
    status.className = "tt-status defect";
  } else {
    status.textContent = "CONFORME";
    status.className = "tt-status ok";
  }

  tt.style.opacity = "1";
}

function hideTooltip() {
  const tt = document.getElementById("cleanTooltip");
  if (tt) tt.style.opacity = "0.7";
}

function handleZoneClick(zone) {
  activeSelectedZone = zone;
  openDefectSheet(zone);
}

function openDefectSheet(zone) {
  document.getElementById("modalZoneCode").textContent = `${zone.id} • ${zone.group}`;
  document.getElementById("modalZoneTitle").textContent = zone.name;

  setModalStatus(zone.status === "defect" ? "defect" : "defect");

  // Restaura chips
  const chips = document.querySelectorAll("#damageTypeChips .chip");
  chips.forEach(c => {
    c.classList.toggle("active", c.textContent.trim() === (zone.damageType || "Rasgo / Furo"));
  });

  // Restaura gravidade
  const radios = document.querySelectorAll('input[name="modalSeverity"]');
  radios.forEach(r => {
    r.checked = (r.value === (zone.severity || "Leve"));
  });

  document.getElementById("modalNotesInput").value = zone.notes || "";
  document.getElementById("defectModal").classList.add("open");
}

function closeDefectModal() {
  document.getElementById("defectModal").classList.remove("open");
}

function setModalStatus(status) {
  currentModalStatus = status;
  const btnOk = document.getElementById("btnStatusOk");
  const btnDefect = document.getElementById("btnStatusDefect");
  const form = document.getElementById("defectDetailsForm");

  if (status === "ok") {
    btnOk.classList.add("selected");
    btnDefect.classList.remove("selected");
    form.style.opacity = "0.3";
    form.style.pointerEvents = "none";
  } else {
    btnDefect.classList.add("selected");
    btnOk.classList.remove("selected");
    form.style.opacity = "1";
    form.style.pointerEvents = "auto";
  }
}

function selectDamageChip(chip) {
  document.querySelectorAll("#damageTypeChips .chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
}

function confirmZoneDefect() {
  if (!activeSelectedZone) return;

  if (currentModalStatus === "ok") {
    activeSelectedZone.status = "ok";
    activeSelectedZone.damageType = null;
    activeSelectedZone.notes = "";
    showToast(`${activeSelectedZone.name}: Conforme`);
  } else {
    activeSelectedZone.status = "defect";
    const activeChip = document.querySelector("#damageTypeChips .chip.active");
    activeSelectedZone.damageType = activeChip ? activeChip.textContent.trim() : "Rasgo / Furo";
    
    const sev = document.querySelector('input[name="modalSeverity"]:checked');
    activeSelectedZone.severity = sev ? sev.value : "Leve";
    activeSelectedZone.notes = document.getElementById("modalNotesInput").value.trim();

    showToast(`Avaria apontada em ${activeSelectedZone.name}`);
  }

  closeDefectModal();
  renderZoneMarkers();
  updateCounters();
  updateJsonPayload();
}

function removeDefectDirect(zoneId) {
  const zone = PARACHUTE_ZONES.find(z => z.id === zoneId);
  if (zone) {
    zone.status = "ok";
    zone.damageType = null;
    zone.notes = "";
    renderZoneMarkers();
    updateCounters();
    updateJsonPayload();
    showToast(`Avaria removida de ${zone.name}`);
  }
}

function resetAllZones() {
  PARACHUTE_ZONES.forEach(z => {
    z.status = "ok";
    z.damageType = null;
    z.notes = "";
  });
  renderZoneMarkers();
  updateCounters();
  updateJsonPayload();
  showToast("Todas as seções foram resetadas");
}

function renderDefectsSummaryList() {
  const container = document.getElementById("defectsSection");
  const list = document.getElementById("defectsListContainer");
  const defects = PARACHUTE_ZONES.filter(z => z.status === "defect");

  document.getElementById("defectsListCount").textContent = defects.length;

  if (defects.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  list.innerHTML = "";

  defects.forEach(z => {
    const sevClass = z.severity === "Grave" ? "grave" : (z.severity === "Média" ? "media" : "leve");
    const row = document.createElement("div");
    row.className = "defect-row";
    row.innerHTML = `
      <div>
        <div class="defect-info-title">${z.id} - ${z.name}</div>
        <div class="defect-info-sub">
          <strong>${z.damageType}</strong> ${z.notes ? '• ' + z.notes : ''}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span class="defect-tag-badge ${sevClass}">${z.severity}</span>
        <button class="btn-del-defect" onclick="removeDefectDirect('${z.id}')" title="Excluir">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    list.appendChild(row);
  });
}

function updateCounters() {
  const total = PARACHUTE_ZONES.length;
  const defects = PARACHUTE_ZONES.filter(z => z.status === "defect").length;
  const ok = total - defects;

  document.getElementById("countOk").textContent = ok;
  document.getElementById("countDefects").textContent = defects;
}

function submitInspection() {
  const defects = PARACHUTE_ZONES.filter(z => z.status === "defect");
  alert(`Inspeção do Velame concluída com sucesso!\n\n• Seções Conformes: ${PARACHUTE_ZONES.length - defects.length}\n• Avarias Registradas: ${defects.length}\n• Laudo registrado.`);
}

function saveDraft() {
  showToast("Rascunho salvo localmente!");
}

function showInfoAlert() {
  alert("Instruções de Inspeção do Paraquedas:\n\n1. Inspecione visualmente o mapa de linhas do velame.\n2. Toque no ponto com avaria para marcar em vermelho.\n3. Indique o tipo de dano e gravidade.\n4. Salve e conclua o laudo.");
}

function updateJsonPayload() {
  const payload = {
    tipoInspecao: "VELAME_PARAQUEDAS",
    descricaoquestao: "01. INSPEÇÃO ESTRUTURAL DO VELAME E LINHAS",
    totalZonas: PARACHUTE_ZONES.length,
    avarias: PARACHUTE_ZONES.filter(z => z.status === "defect").map(z => ({
      codigo: z.id,
      componente: z.name,
      grupo: z.group,
      tipoDano: z.damageType,
      gravidade: z.severity,
      obs: z.notes
    }))
  };

  const codeView = document.getElementById("jsonCodeView");
  if (codeView) {
    codeView.textContent = JSON.stringify(payload, null, 2);
  }
}

function toggleJsonDrawer() {
  document.getElementById("jsonDrawer").classList.toggle("open");
  updateJsonPayload();
}

function showToast(msg) {
  const toast = document.getElementById("appToast");
  document.getElementById("toastMsg").textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function startClock() {
  const clock = document.getElementById("liveClock");
  if (!clock) return;
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  tick();
  setInterval(tick, 1000);
}
