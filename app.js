/**
 * CheckDetour - Professional Parachute & Canopy Inspection Component
 * 100% focused on Ram-Air Parachute Inspection (Canopy, Cells, Lines, Slider, Risers)
 */

// Zonas Técnicas do Paraquedas (Mapeadas no SVG 1000x800)
const PARACHUTE_ZONES = [
  // 1. VELAME PRINCIPAL - 9 CÉLULAS (PLANTA / EXTRADORSO)
  { id: "CEL-01", name: "Célula 01 (Ponta Esquerda)", group: "Velame", points: "50,70 140,70 140,290 50,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-02", name: "Célula 02 (Esquerda)", group: "Velame", points: "145,70 235,70 235,290 145,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-03", name: "Célula 03 (Esquerda)", group: "Velame", points: "240,70 330,70 330,290 240,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-04", name: "Célula 04 (Centro-Esquerda)", group: "Velame", points: "335,70 425,70 425,290 335,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-05", name: "Célula 05 (Célula Central)", group: "Velame", points: "430,70 520,70 520,290 430,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-06", name: "Célula 06 (Centro-Direita)", group: "Velame", points: "525,70 615,70 615,290 525,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-07", name: "Célula 07 (Direita)", group: "Velame", points: "620,70 710,70 710,290 620,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-08", name: "Célula 08 (Direita)", group: "Velame", points: "715,70 805,70 805,290 715,290", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "CEL-09", name: "Célula 09 (Ponta Direita)", group: "Velame", points: "810,70 900,70 900,290 810,290", status: "ok", damageType: null, severity: "Leve", notes: "" },

  // 2. ESTABILIZADORES LATERAIS (STABILIZERS / AIR DEFLECTORS)
  { id: "EST-ESQ", name: "Estabilizador Lateral Esq.", group: "Estabilizador", points: "20,100 45,100 45,260 20,260", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "EST-DIR", name: "Estabilizador Lateral Dir.", group: "Estabilizador", points: "905,100 930,100 930,260 905,260", status: "ok", damageType: null, severity: "Leve", notes: "" },

  // 3. PERFIL AEROFÓLIO & COSTELAS INTERNAS (AIRFOIL PROFILE)
  { id: "PRF-ATAQ", name: "Borda de Ataque / Bocas de Ar", group: "Perfil", points: "60,390 150,390 150,490 60,490", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "PRF-COST", name: "Costelas / Cross-Ports Internos", group: "Perfil", points: "155,390 280,390 280,490 155,490", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "PRF-FUGA", name: "Borda de Fuga / Saída do Aerofólio", group: "Perfil", points: "285,390 380,390 380,490 285,490", status: "ok", damageType: null, severity: "Leve", notes: "" },

  // 4. SUSPENSÃO, LINHAS & CONTROLE (LINES & SLIDER)
  { id: "LIN-SUSP", name: "Linhas de Suspensão (Grupo A / B / C)", group: "Linhas", points: "440,380 570,380 570,470 440,470", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "LIN-FREI", name: "Linhas de Freio / Linhas de Controle", group: "Linhas", points: "580,380 700,380 700,470 580,470", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "EQP-SLID", name: "Slider (Deslizador e Ilhoses)", group: "Controle", points: "460,485 580,485 580,565 460,565", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "EQP-RISE", name: "Tirantes (Risers) & Argolas 3-Ring", group: "Controle", points: "590,485 700,485 700,565 590,565", status: "ok", damageType: null, severity: "Leve", notes: "" },

  // 5. VELAME PILOTO & EXTRAÇÃO (PILOT CHUTE & BRIDLE)
  { id: "PIL-CHUT", name: "Velame Piloto (Pilot Chute)", group: "Extração", points: "760,380 910,380 910,480 760,480", status: "ok", damageType: null, severity: "Leve", notes: "" },
  { id: "PIL-BRID", name: "Fita de Extração (Bridle & Kill-line)", group: "Extração", points: "760,490 910,490 910,565 760,565", status: "ok", damageType: null, severity: "Leve", notes: "" }
];

let activeSelectedZone = null;
let currentModalStatus = "defect";

document.addEventListener("DOMContentLoaded", () => {
  renderSvgPolygons();
  updateCounters();
  updateJsonPayload();
  startClock();
});

function renderSvgPolygons() {
  const group = document.getElementById("zonesGroup");
  if (!group) return;
  group.innerHTML = "";

  PARACHUTE_ZONES.forEach(zone => {
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", zone.points);
    poly.setAttribute("class", `zone-polygon state-${zone.status}`);
    poly.setAttribute("id", `poly-${zone.id}`);
    
    // Tooltip
    poly.addEventListener("mouseenter", () => showTooltip(zone));
    poly.addEventListener("mouseleave", () => hideTooltip());
    
    // Click
    poly.addEventListener("click", () => handleZoneClick(zone));

    group.appendChild(poly);
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
  renderSvgPolygons();
  updateCounters();
  updateJsonPayload();
}

function removeDefectDirect(zoneId) {
  const zone = PARACHUTE_ZONES.find(z => z.id === zoneId);
  if (zone) {
    zone.status = "ok";
    zone.damageType = null;
    zone.notes = "";
    renderSvgPolygons();
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
  renderSvgPolygons();
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
  alert("Instruções de Inspeção do Paraquedas:\n\n1. Inspecione visualmente o velame, células, costelas, linhas e slider.\n2. Toque no componente com avaria para marcar em vermelho.\n3. Indique o tipo de dano e gravidade.\n4. Salve e conclua o laudo.");
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
