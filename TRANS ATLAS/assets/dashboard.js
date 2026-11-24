/* LOGIFLOW dashboard and workflow refresh */
const lfDemoDate = '2026-11-24';
const lfR=[
{"ref":"EXP-2026-0842","client":"Atlas Industries","route":"Casablanca → Tanger Med","zone":"National","carrier":"Trans Atlas","plate":"45 678-A-6","truck":"Semi-remorque bâchée","weight":18.4,"volume":68,"pallets":28,"incoterm":"","dispatch":"2026-11-19","eta":"2026-11-20","delivered":"2026-11-20","status":"Livrée","goods":"Composants automobiles","price":8400,"cost":7850,"distanceKm":367,"receivedPallets":28,"invoiceRef":"FAC-2026-098","pod":"Disponible","scenario":"Livrée à temps et complète, facture émise."},
{"ref":"EXP-2026-0843","client":"Agro Maroc","route":"Agadir → Rotterdam","zone":"Europe","carrier":"Souss Transport","plate":"23 519-B-6","truck":"Semi-remorque frigorifique","weight":20,"volume":82,"pallets":30,"incoterm":"CPT","dispatch":"2026-11-18","eta":"2026-11-23","status":"En transit","goods":"Agrumes frais · 4 °C","price":29800,"cost":25200,"distanceKm":3148,"scenario":"Retard ouvert après une excursion de température."},
{"ref":"EXP-2026-0844","client":"Maroc Distribution","route":"Casablanca → Dakar","zone":"Afrique subsaharienne","carrier":"Maghreb Express","plate":"67 214-A-6","truck":"Tautliner","weight":21.5,"volume":88,"pallets":32,"incoterm":"DAP","dispatch":"2026-11-18","eta":"2026-11-26","status":"En douane","goods":"Produits secs · passage frontière","price":34600,"cost":30200,"distanceKm":2843,"scenario":"Contrôle du dossier de passage frontière en cours. Camion dédié à cette expédition."},
{"ref":"EXP-2026-0845","client":"Textile du Nord","route":"Tanger → Barcelone","zone":"Europe","carrier":"Nord Cargo","plate":"34 127-C-6","truck":"Porte-conteneur","capacityT":25,"weight":19,"volume":58,"pallets":24,"incoterm":"FCA","dispatch":"2026-11-15","eta":"2026-11-19","delivered":"2026-11-20","status":"Livrée","goods":"Textile conditionné","price":24200,"cost":19800,"distanceKm":1095,"receivedPallets":24,"pod":"Manquante","scenario":"Livrée avec un jour de retard."},
{"ref":"EXP-2026-0847","client":"Atlas Industries","route":"Rabat → Marrakech","zone":"National","carrier":"Trans Atlas","plate":"78 403-A-6","truck":"Porteur plateau","capacityT":12,"weight":8.2,"volume":34,"pallets":10,"incoterm":"","dispatch":"2026-11-19","eta":"2026-11-20","status":"En transit","goods":"Équipements industriels","price":6900,"cost":6300,"distanceKm":319,"scenario":"Livraison promise dépassée. Transporteur à relancer."},
{"ref":"EXP-2026-0850","client":"Fresh Export","route":"Agadir → Rotterdam","zone":"Europe","carrier":"Nord Cargo","plate":"31 806-C-6","truck":"Semi-remorque frigorifique","weight":18,"volume":78,"pallets":28,"incoterm":"CIP","dispatch":"2026-11-14","eta":"2026-11-18","delivered":"2026-11-17","status":"Livrée","goods":"Fruits et légumes frais · 4 °C","price":31400,"cost":27000,"distanceKm":3148,"receivedPallets":26,"pod":"Disponible avec réserve","scenario":"Livrée à temps, mais 26 palettes reçues sur 28."},
{"ref":"EXP-2026-0851","client":"Maroc Distribution","route":"Casablanca → Nouakchott","zone":"Afrique subsaharienne","carrier":"Maghreb Express","plate":"68 312-A-6","truck":"Tautliner","weight":20.5,"volume":77,"pallets":30,"incoterm":"DAP","dispatch":"2026-11-24","eta":"2026-11-28","status":"En transit","goods":"Produits alimentaires secs","price":24500,"cost":20800,"distanceKm":2332,"scenario":"Camion parti, livraison prévue dans le délai convenu. Camion dédié à cette expédition."},
{"ref":"EXP-2026-0852","client":"Atlas Industries","route":"Casablanca → Bamako","zone":"Afrique subsaharienne","carrier":"Maghreb Express","plate":"62 491-A-6","truck":"Semi-remorque bâchée","weight":19.2,"volume":72,"pallets":27,"incoterm":"DAP","dispatch":"2026-11-24","eta":"2026-11-30","status":"En transit","goods":"Pièces industrielles","price":42800,"cost":36900,"distanceKm":3672,"scenario":"Trajet vers Bamako en cours."},
{"ref":"EXP-2026-0853","client":"Atlas Industries","route":"Casablanca → Fès","zone":"National","carrier":"Trans Atlas","plate":"46 291-A-6","truck":"Semi-remorque bâchée","weight":16.2,"volume":56,"pallets":23,"incoterm":"","dispatch":"2026-11-23","eta":"2026-11-24","delivered":"2026-11-24","status":"Livrée","goods":"Composants automobiles","price":7400,"cost":6200,"distanceKm":294,"receivedPallets":23,"pod":"Disponible","scenario":"Livrée à temps et complète."},
{"ref":"EXP-2026-0854","client":"Textile du Nord","route":"Tanger → Lyon","zone":"Europe","carrier":"Nord Cargo","plate":"32 113-C-6","truck":"Semi-remorque bâchée","weight":17.8,"volume":69,"pallets":28,"incoterm":"CPT","dispatch":"2026-11-24","eta":"2026-11-28","status":"Chargement","goods":"Textile conditionné","price":26400,"cost":22400,"distanceKm":1715,"scenario":"Camion affecté. Chargement à Tanger avant le départ."},
];
function lfStatus(r){if(r.delivered)return 'Livrée';return r.eta<lfDemoDate?'En retard':r.status}
function lfMoney(n){return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(n)+' MAD'}
function lfEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function lfDate(s){return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',timeZone:'Africa/Casablanca'}).format(new Date(s+'T12:00:00'))}
function lfPeriod(){return lfR.filter(r=>r.dispatch>=dashboardStart&&r.dispatch<=dashboardEnd)}
const lfFleet=[['Semi-remorque bâchée',32],['Tautliner',18],['Frigorifique',20],['Citerne',8],['Plateau',12],['Porte-conteneur',14],['ADR (matières dangereuses)',6]];
const lfAlerts=[
{kind:'Excursion de température',severity:'critique',days:0,ref:'EXP-2026-0843',impact:'Risque qualité · Agro Maroc',route:'Agadir → Rotterdam'},
{kind:'Preuve de livraison (POD) manquante',severity:'moyenne',days:2,ref:'EXP-2026-0845',impact:'Justificatif à récupérer · Textile du Nord',route:'Tanger → Barcelone'},
{kind:'Document de frontière à confirmer',severity:'moyenne',days:0,ref:'EXP-2026-0844',impact:'Vérifier le dossier de passage · Maroc Distribution',route:'Casablanca → Dakar'}];
let lfFilters={status:'',client:'',carrier:'',zone:'',search:'',sort:'dispatch',direction:-1,page:1};
function lfFiltered(){let a=lfPeriod().filter(r=>(!lfFilters.status||lfStatus(r)===lfFilters.status)&&(!lfFilters.client||r.client===lfFilters.client)&&(!lfFilters.carrier||r.carrier===lfFilters.carrier)&&(!lfFilters.zone||r.zone===lfFilters.zone)&&(!lfFilters.search||Object.values(r).join(' ').toLowerCase().includes(lfFilters.search)));a.sort((x,y)=>{let p=x[lfFilters.sort],q=y[lfFilters.sort];if(lfFilters.sort==='status'){p=lfStatus(x);q=lfStatus(y)}return (p<q?-1:p>q?1:0)*lfFilters.direction});return a}
function lfTable(){let rows=lfFiltered(),pages=Math.max(1,Math.ceil(rows.length/6));lfFilters.page=Math.min(lfFilters.page,pages);let view=rows.slice((lfFilters.page-1)*6,lfFilters.page*6),cols=[['ref','Référence'],['client','Client'],['route','Trajet'],['zone','Zone'],['carrier','Transporteur'],['truck','Type de camion'],['weight','Poids / volume'],['incoterm','Incoterm'],['eta','ETA'],['margin','Marge (MAD)'],['status','Statut']];
let head=cols.map(c=>'<th><button data-lf-sort="'+c[0]+'">'+c[1]+' '+(lfFilters.sort===c[0]?(lfFilters.direction===1?'↑':'↓'):'↕')+'</button></th>').join('');
let body=view.map(r=>'<tr tabindex="0" data-lf-row="'+r.ref+'"><td><b>'+r.ref+'</b></td><td>'+lfEsc(r.client)+'</td><td>'+lfEsc(r.route)+'</td><td>'+lfEsc(r.zone)+'</td><td>'+lfEsc(r.carrier)+'<small class="lf-plate">'+lfEsc(r.plate)+'</small></td><td>'+lfEsc(r.truck)+'</td><td>'+r.weight.toLocaleString('fr-FR')+' t / '+r.volume+' m³</td><td>'+lfEsc(r.incoterm || '—')+'</td><td>'+lfDate(r.eta)+'</td><td>'+lfMoney(r.price-r.cost)+'</td><td><span class="lf-status '+lfStatus(r).toLowerCase().replaceAll(' ','-')+'">'+lfStatus(r)+'</span></td></tr>').join('');
let opts=(id,label,items,val)=>'<label>'+label+'<select id="'+id+'"><option value="">Tous</option>'+items.map(x=>'<option value="'+lfEsc(x)+'" '+(x===val?'selected':'')+'>'+lfEsc(x)+'</option>').join('')+'</select></label>';
let cnt=s=>lfPeriod().filter(r=>lfStatus(r)===s).length;
return '<div class="lf-quick"><button data-lf-quick="Livrée" class="'+(lfFilters.status==='Livrée'?'active':'')+'">Livrées <b>'+cnt('Livrée')+'</b></button><button data-lf-quick="En retard" class="'+(lfFilters.status==='En retard'?'active':'')+'">En retard <b>'+cnt('En retard')+'</b></button></div><div class="lf-filters"><input id="lf-search" placeholder="Rechercher une référence, un trajet…" value="'+lfEsc(lfFilters.search)+'">'+opts('lf-status','Statut',[...new Set(lfPeriod().map(lfStatus))],lfFilters.status)+opts('lf-client','Client',[...new Set(lfPeriod().map(r=>r.client))],lfFilters.client)+opts('lf-carrier','Transporteur',[...new Set(lfPeriod().map(r=>r.carrier))],lfFilters.carrier)+opts('lf-zone','Zone',[...new Set(lfPeriod().map(r=>r.zone))],lfFilters.zone)+'</div><div class="lf-table-wrap"><table class="lf-table"><thead><tr>'+head+'</tr></thead><tbody>'+(body||'<tr><td colspan="11">Aucune expédition ne correspond aux filtres choisis.</td></tr>')+'</tbody></table></div><div class="lf-pagination"><span>'+rows.length+' expéditions · page '+lfFilters.page+' / '+pages+'</span><div><button data-lf-pg="'+Math.max(1,lfFilters.page-1)+'" '+(lfFilters.page===1?'disabled':'')+'>Précédent</button><button data-lf-pg="'+Math.min(pages,lfFilters.page+1)+'" '+(lfFilters.page===pages?'disabled':'')+'>Suivant</button></div></div>'}
function lfKpi(label,value,note){return '<article class="lf-kpi"><span>'+label+'</span><b>'+value+'</b>'+(note?'<small class="lf-kpi-note">'+note+'</small>':'')+'</article>'}
const lfChartSeries = [['done', 'Livrées', '#16845e'], ['transit', 'En cours', '#2671b5'], ['late', 'En retard', '#bf4c42']];

function lfChartGroup(row) {
  const status = lfStatus(row);
  if (status === 'Livrée') return 'done';
  if (status === 'En retard') return 'late';
  if (['En transit', 'Chargement', 'En douane'].includes(status)) return 'transit';
}

function lfShowChartPoint(point) {
  const week = Number(point.dataset.lfChartWeek);
  const key = point.dataset.lfChartStatus;
  const weekMs = 7 * 86400000;
  const start = Date.parse(dashboardStart) + week * weekMs;
  const rows = lfPeriod().filter(row => {
    const dispatch = Date.parse(row.dispatch);
    return dispatch >= start && dispatch < start + weekMs && lfChartGroup(row) === key;
  });
  const container = document.querySelector('#lf-chart-selection');
  const current = document.querySelector('[data-lf-chart-week][aria-pressed="true"]');
  if (current) {
    current.setAttribute('aria-pressed', 'false');
    current.querySelector('circle.lf-chart-marker').setAttribute('stroke-width', '2');
  }
  point.setAttribute('aria-pressed', 'true');
  point.querySelector('circle.lf-chart-marker').setAttribute('stroke-width', '4');
  container.innerHTML = '<h3>' + lfEsc(point.getAttribute('aria-label')) + '</h3>' +
    (rows.length ? '<ul>' + rows.map(row =>
      '<li><button type="button" class="text-button" data-lf-row="' + lfEsc(row.ref) + '">' +
      lfEsc(row.ref + ' · ' + row.route) + '</button> · ' + lfEsc(lfStatus(row)) + '</li>').join('') + '</ul>'
      : '<p>Aucune expédition pour ce point.</p>');
}

function lfChart() {
  const day = 86400000;
  const start = Date.parse(dashboardStart);
  const end = Date.parse(dashboardEnd);
  const weeks = new Map();
  for (const row of lfPeriod()) {
    const week = Math.floor((Date.parse(row.dispatch) - start) / (7 * day));
    if (!weeks.has(week)) weeks.set(week, {done: 0, transit: 0, late: 0});
    const group = lfChartGroup(row);
    if (group) weeks.get(week)[group]++;
  }
  const weekCount = Math.floor((end - start) / (7 * day)) + 1;
  const indexes = weekCount <= 12 ? Array.from({length: weekCount}, (_, index) => index) : [...weeks.keys()].sort((a, b) => a - b);
  const total = counts => counts.done + counts.transit + counts.late;
  const maximum = Math.max(1, ...Array.from(weeks.values(), total));
  const date = new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: '2-digit', timeZone: 'UTC'});
  const series = lfChartSeries;
  const width = Math.max(400, indexes.length * 88);
  const x = i => indexes.length === 1 ? width / 2 : 38 + i * (width - 76) / (indexes.length - 1);
  const step = Math.max(1, Math.ceil(maximum / 5));
  const ceiling = Math.ceil(maximum / step) * step;
  const y = value => 140 - 125 * value / ceiling;
  const buckets = indexes.map(index => {
    const from = start + index * 7 * day;
    return [date.format(from) + '–' + date.format(Math.min(end, from + 6 * day)),
      weeks.get(index) ?? {done: 0, transit: 0, late: 0}];
  });
  const grid = Array.from({length: ceiling / step + 1}, (_, i) => i * step).map(value =>
    '<line x1="38" x2="' + (width - 38) + '" y1="' + y(value) + '" y2="' + y(value) +
    '" stroke="#dce6e0"/><text x="29" y="' + (y(value) + 4) + '" text-anchor="end">' + value + '</text>').join('');
  // Spread markers with identical values so each status can be selected.
  const pointX = (counts, j, key) => {
    const tied = series.filter(([other]) => counts[other] === counts[key]).map(([other]) => other);
    return x(j) + (tied.indexOf(key) - (tied.length - 1) / 2) * 18;
  };
  const lines = series.map(([key, , color], i) => {
    const points = buckets.map(([, counts], j) => pointX(counts, j, key) + ',' + y(counts[key])).join(' ');
    const dash = ['', ' stroke-dasharray="6 3"', ' stroke-dasharray="2 3"'][i];
    return '<polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2"' + dash + '/>';
  }).join('');
  const dots = buckets.map(([label, counts], j) => series.filter(([key]) => counts[key] > 0).map(([key, name, color]) => {
    const marker = ' cx="' + pointX(counts, j, key) + '" cy="' + y(counts[key]) + '"';
    const title = label + ' · ' + name + ' : ' + counts[key];
    return '<g role="button" tabindex="0" aria-pressed="false" aria-label="' + lfEsc(title) +
      '" data-lf-chart-week="' + indexes[j] + '" data-lf-chart-status="' + key + '" style="cursor:pointer">' +
      '<title>' + lfEsc(title) + '</title><circle' + marker + ' r="9" fill="transparent"/>' +
      '<circle class="lf-chart-marker"' + marker + ' r="4" fill="white" stroke="' + color + '" stroke-width="2"/></g>';
  }).join('')).join('');
  const labels = buckets.map(([label], i) => '<text x="' + x(i) + '" y="162" text-anchor="middle">' + label + '</text>').join('');
  const legend = series.map(([, name, color]) => '<small style="color:' + color + '">━ ' + name + '</small>').join('');
  return '<div class="lf-legend">' + legend + '</div><div style="overflow-x:auto">' +
    '<svg role="group" aria-label="Activité hebdomadaire des expéditions" viewBox="0 0 ' + width +
    ' 174" style="display:block;width:100%;min-width:' + width + 'px;font-size:11px" fill="#53675f">' +
    grid + lines + labels + dots + '</svg></div>' +
    '<div id="lf-chart-selection" aria-live="polite"><p>Sélectionnez un point pour voir les expéditions.</p></div>';
}
function lfTrucks() {
  const rows = lfPeriod();
  return lfFleet.map(([name, fleetSize]) => {
    const shipments = rows.filter(row => {
      if (name === 'Frigorifique') return row.truck.toLowerCase().includes('frigorifique');
      if (name === 'Plateau') return row.truck.toLowerCase().includes('plateau');
      if (name.startsWith('ADR')) return row.truck.startsWith('ADR');
      return row.truck === name;
    });
    const used = new Set(shipments.map(row => row.plate)).size;
    const utilization = fleetSize ? Math.round(used / fleetSize * 100) : 0;
    const weight = shipments.reduce((sum, row) => sum + row.weight, 0).toLocaleString('fr-FR');
    const list = shipments.length ? '<ul>' + shipments.map(row =>
      '<li><button type="button" class="text-button" data-lf-row="' + lfEsc(row.ref) + '">' +
      lfEsc(row.ref + ' · ' + row.route) + '</button> · ' + lfEsc(row.plate) + ' · ' + row.weight.toLocaleString('fr-FR') + ' t · ' + lfEsc(lfStatus(row)) + '</li>'
    ).join('') + '</ul>' : '<p>Aucune expédition de ce type sur la période.</p>';
    return '<div class="lf-truck"><div><b>' + lfEsc(name) + '</b><strong>' + used + ' / ' +
      fleetSize + ' camions · ' + utilization + ' %</strong></div><i><span style="width:' +
      utilization + '%"></span></i><small>' + shipments.length + ' expédition(s) · ' + weight +
      ' t · flotte ' + fleetSize + ' véhicules</small><details><summary style="cursor:pointer">' +
      'Voir les expéditions <span aria-hidden="true">· ' + shipments.length + '</span></summary>' + list + '</details></div>';
  }).join('') + '<p class="lf-note">Les types sans mission restent à 0 %. Capacités indicatives à vérifier selon la carte grise, le PTAC et la configuration réelle.</p>';
}
function lfAlertHtml(){return lfAlerts.map(a=>'<article class="lf-alert '+a.severity+'"><div><b>'+a.kind+'</b><span>depuis '+a.days+' j · '+(a.severity==='critique'?'Critique':'Moyenne')+'</span></div><a href="#" data-lf-row="'+a.ref+'">'+a.ref+' · '+a.route+'</a><p>'+a.impact+'</p><footer><button data-lf-act="Relancer le transporteur" data-ref="'+a.ref+'">Relancer le transporteur</button><button data-lf-act="Téléverser le document" data-ref="'+a.ref+'">Téléverser le document</button><button data-lf-act="Prévenir le client" data-ref="'+a.ref+'">Prévenir le client</button></footer></article>').join('')}
function lfFunnelHtml(rows) {
  const assigned = rows.filter(row => row.carrier && row.plate);
  const inTransport = assigned.filter(row => row.delivered ||
    (row.dispatch <= lfDemoDate && ['En transit', 'En douane', 'En retard'].includes(row.status)));
  const delivered = inTransport.filter(row => row.delivered && row.delivered <= lfDemoDate);
  const steps = [
    ['Demande', null],
    ['Cotation', null],
    ['Appel d’offres', null],
    ['Attribué', assigned.length],
    ['En transport', inTransport.length],
    ['Livré', delivered.length],
    ['Facturé', delivered.filter(row => row.invoiceRef).length]
  ];
  return '<div class="lf-funnel">' + steps.map(([label, count], index) => {
    const previous = steps[index - 1]?.[1];
    const note = count === null ? 'Non renseigné' :
      previous > 0 ? Math.round(count / previous * 100) + ' % de l’étape précédente' :
      label === 'Attribué' ? 'Transporteur et véhicule affectés' : '';
    const width = assigned.length && count !== null ? count / assigned.length * 100 : 0;
    return '<div><span>' + label + '</span><b>' + (count ?? '—') +
      '</b><i><em style="width:' + width + '%"></em></i><small>' + note + '</small></div>';
  }).join('') + '</div>';
}
function lfTitle(){return '<div class="lf-title"><div><div class="lf-breadcrumb">Accueil <span>›</span> Tableau de bord <span class="lf-mode">Mode démo · 24 nov. 2026</span></div><h1>Tableau de bord</h1></div><div class="lf-actions"><button data-lf-create="Nouvelle expédition">＋ Nouvelle expédition</button></div></div>'}
function lfPayload(row) {
  const type = row.truck === 'Tautliner' ? 'Semi-remorque tautliner' : row.truck;
  return row.capacityT ?? truckCatalog().find(truck => truck.type === type)?.payload;
}

function lfLoadFactor(row) {
  const payload = lfPayload(row);
  return payload > 0 && Number.isFinite(row.weight) ? 100 * row.weight / payload : null;
}

function lfOperationalKpis(rows, delivered) {
  const number = new Intl.NumberFormat('fr-FR', {maximumFractionDigits: 2});
  const format = (value, unit) => value === null ? '—' : number.format(value) + ' ' + unit;
  const sum = (items, key) => items.reduce((total, row) => total + row[key], 0);
  const duration = delivered.map(row => (Date.parse(row.delivered) - Date.parse(row.dispatch)) / 86400000)
    .filter(days => Number.isFinite(days) && days >= 0);
  const average = values => values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  const filling = rows.map(lfLoadFactor).filter(Number.isFinite);
  const roadRows = rows.filter(row => Number.isFinite(row.cost) && Number.isFinite(row.distanceKm) && row.distanceKm > 0);
  const costKm = roadRows.length ? sum(roadRows, 'cost') / sum(roadRows, 'distanceKm') : null;
  const cards = [
    ['Tonnage transporté', format(sum(rows.filter(row => Number.isFinite(row.weight)), 'weight'), 't'), 'Poids des expéditions parties sur la période'],
    ['Coût moyen au kilomètre', format(costKm, 'MAD/km')],
    ['Expéditions livrées', delivered.length, 'Livraisons effectuées pour les expéditions de la période'],
    ['Délai moyen de transit', format(average(duration), 'j'), 'Du départ à la livraison effective'],
    ['Taux de remplissage moyen', format(average(filling), '%')]
  ];
  return cards.map(([label, value, note]) => lfKpi(label, value, note)).join('');
}

function lfOtif() {
  const due = lfR.filter(row => row.eta >= dashboardStart && row.eta <= dashboardEnd && row.eta <= lfDemoDate);
  const met = due.filter(row => row.delivered && row.delivered <= row.eta && row.receivedPallets === row.pallets);
  return {due: due.length, met: met.length, label: due.length ? Math.round(100 * met.length / due.length) + ' %' : '—'};
}

function dashboard(){let rows=lfPeriod(),done=rows.filter(r=>lfStatus(r)==='Livrée'),otif=lfOtif(),margin=rows.reduce((n,r)=>n+r.price-r.cost,0),unpaid=invoices.filter(i=>['À payer','En retard','Partielle'].includes(i[4])).reduce((n,i)=>n+({'FAC-2026-098':12000,'FAC-2026-097':18200,'FAC-2026-096':12800,'FAC-2026-095':9400,'FAC-2026-094':20400}[i[0]]||0),0),active=rows.map(lfStatus).filter(s=>['En transit','Chargement','En douane'].includes(s)).length,open=offers.filter(o=>o[6]==='Ouvert'||o[6]==='Côture proche').length;
return lfTitle()+'<div class="lf-period"><label>Du <input id="dashboardStart" type="date" value="'+dashboardStart+'"></label><label>Au <input id="dashboardEnd" type="date" value="'+dashboardEnd+'"></label><span>'+rows.length+' expéditions · '+lfDate(dashboardStart)+' — '+lfDate(dashboardEnd)+'</span></div><div class="lf-kpis">'+lfKpi('Nombre d’expéditions',rows.length,'')+lfKpi('En cours',active,'')+lfKpi('En retard',rows.filter(row=>lfStatus(row)==='En retard').length,'Missions ouvertes dont la date promise est dépassée')+lfKpi('OTIF',otif.label,otif.met+'/'+otif.due+' livraisons dues, à l’heure et complètes')+lfKpi('Marge brute',lfMoney(margin),'Prix client − coût transporteur')+lfKpi('Appels d’offres sans réponse',open,'Dossiers ouverts')+lfKpi('Factures impayées',lfMoney(unpaid),'DSO : 32 jours')+lfOperationalKpis(rows,done)+'</div><div class="lf-grid"><section class="lf-card"><h2>Activité des expéditions</h2><p>Volumes hebdomadaires selon le statut · période sélectionnée</p>'+(rows.length?lfChart():'Aucune expédition pour cette période.')+'</section><section class="lf-card"><h2>Types de camions utilisés</h2><p>Taux d’utilisation, nombre de missions et tonnage</p>'+lfTrucks()+'</section></div><section class="lf-card"><h2>Entonnoir commercial</h2><p>Dossiers de la période sélectionnée et taux de passage par étape</p>'+lfFunnelHtml(rows)+'</section><section class="lf-card"><h2>Expéditions par destination</h2><p>Filtres, tri par colonne et panneau de détail au clic</p><div id="lf-table-root">'+lfTable()+'</div></section><section class="lf-card"><h2>Alertes et risques</h2><p>'+lfAlerts.length+' alertes actives · réclamations ouvertes suivies séparément</p><div class="lf-alerts">'+lfAlertHtml()+'</div></section><div id="lf-drawer"></div>'}
function lfNav(){let count=disputes.filter(d=>d[4]!=='Résolu').length,ops=[['dashboard','▦','Tableau de bord'],['shipments','⇄','Expéditions'],['offers','◇','Appels d’offres'],['tracking','⌖','Suivi d’expédition'],['documents','▤','Documents'],['billing','▧','Facturation'],['disputes','⚑','Litiges']],mg=[['clients','♙','Clients'],['carriers','▣','Transporteurs'],['tariffs','⌁','Tarifs et grilles'],['reports','▥','Rapports']];document.querySelector('#nav').innerHTML='<div class="lf-nav-group"><small>EXPLOITATION</small>'+ops.map(x=>'<button data-page="'+x[0]+'" class="'+(page===x[0]?'active':'')+'"><span class="nav-icon">'+x[1]+'</span>'+x[2]+(x[0]==='disputes'?'<i>'+count+'</i>':'')+'</button>').join('')+'</div><div class="lf-nav-group"><small>GESTION</small>'+mg.map(x=>'<button data-page="'+x[0]+'" class="'+(page===x[0]?'active':'')+'"><span class="nav-icon">'+x[1]+'</span>'+x[2]+'</button>').join('')+'</div>';document.querySelector('#nav').onclick=e=>{let b=e.target.closest('[data-page]');if(b){e.preventDefault();e.stopPropagation();go(b.dataset.page)}}}
function lfSimple(k){if(k==='shipments')return '<div class="lf-title"><div><div class="lf-breadcrumb">Accueil › Expéditions</div><h1>Expéditions</h1><p>Portefeuille des missions de transport.</p></div></div><section class="lf-card"><div id="lf-table-root">'+lfTable()+'</div></section><div id="lf-drawer"></div>';let title=k==='tariffs'?'Tarifs et grilles':'Rapports';return '<div class="lf-title"><div><div class="lf-breadcrumb">Accueil › Gestion › '+title+'</div><h1>'+title+'</h1><p>Indicateurs et référentiel du commissionnaire.</p></div></div><section class="lf-card"><h2>'+title+' · MAD</h2><p>National : marge maximale de 800 MAD · international : marge minimale de 3 000 MAD.</p><p>Valeurs de démonstration à valider selon les accords transporteurs et les frais de passage frontière.</p></section>'}
const lfBaseRender=render;
render=function(){if(['dashboard','shipments','tariffs','reports','carriers'].includes(page)){document.querySelector('#workspaceTitle').textContent='Commissionnaire';document.querySelector('#workspaceSub').textContent='Atlas Logistics';document.querySelector('#context').textContent='Accueil › '+({dashboard:'Tableau de bord',shipments:'Expéditions',tariffs:'Tarifs et grilles',reports:'Rapports',carriers:'Transporteurs'}[page]);document.querySelector('#app').innerHTML=page==='dashboard'?dashboard():page==='carriers'?carriersPage():lfSimple(page);makeMobileNav()}else{lfBaseRender();document.querySelector('#context').textContent='Accueil › '+({offers:'Appels d’offres',tracking:'Suivi d’expédition',documents:'Documents',billing:'Facturation',disputes:'Litiges',clients:'Clients',carriers:'Transporteurs'}[page]||page)}lfNav()}

function lfDemoDeliveryDetails(row) {
  const fields = [['Situation', row.scenario]];
  const filling = lfLoadFactor(row);
  if (filling !== null) {
    const format = new Intl.NumberFormat('fr-FR', {maximumFractionDigits: 2});
    fields.push(['Charge utile indicative', format.format(lfPayload(row)) + ' t']);
    fields.push(['Remplissage en poids', format.format(filling) + ' %']);
  }
  if (row.delivered) {
    fields.push(['Livraison effective', lfDate(row.delivered)]);
    fields.push(['Palettes reçues / prévues', (row.receivedPallets ?? '—') + ' / ' + row.pallets]);
    fields.push(['Preuve de livraison', row.pod ?? 'Non renseignée']);
    if (row.invoiceRef) fields.push(['Facture', row.invoiceRef]);
  }
  return fields.filter(([, value]) => value).map(([label, value]) =>
    '<span>' + label + '</span><b>' + lfEsc(value) + '</b>').join('');
}

function lfDrawer(ref){let r=lfR.find(x=>x.ref===ref);if(!r)return;let a=lfAlerts.find(x=>x.ref===ref),s=lfStatus(r);document.querySelector('#lf-drawer').innerHTML='<div class="lf-overlay" data-lf-close></div><aside class="lf-drawer-panel"><button data-lf-close class="lf-x">×</button><small>DOSSIER TRANSPORT</small><h2>'+r.ref+'</h2><b class="lf-status '+s.toLowerCase().replaceAll(' ','-')+'">'+s+'</b><h3>'+lfEsc(r.route)+'</h3><p>'+lfEsc(r.client)+' · '+lfEsc(r.zone)+'</p><div class="lf-details"><span>Transporteur / plaque</span><b>'+lfEsc(r.carrier)+' · '+lfEsc(r.plate)+'</b><span>Camion</span><b>'+lfEsc(r.truck)+'</b><span>Poids / volume / palettes</span><b>'+r.weight+' t · '+r.volume+' m³ · '+r.pallets+'</b><span>'+(r.incoterm?'Incoterm · ETA':'ETA')+'</span><b>'+(r.incoterm?lfEsc(r.incoterm)+' · ':'')+lfDate(r.eta)+'</b><span>Prix · coût · marge</span><b>'+lfMoney(r.price)+' · '+lfMoney(r.cost)+' · '+lfMoney(r.price-r.cost)+'</b><span>Marchandise</span><b>'+lfEsc(r.goods)+'</b>'+lfDemoDeliveryDetails(r)+'</div><h3>Étapes et documents</h3><p>Demande → transporteur attribué → chargement → passage frontière → livraison</p><p>CMR · bon de chargement · '+(r.delivered?'preuve de livraison':'documents transport')+'</p><h3>Alertes et historique</h3><p>'+(a?lfEsc(a.kind)+' · depuis '+a.days+' j':'Aucune alerte active')+'</p><p>Dernière activité : '+lfDate(r.dispatch)+'</p></aside>'}
function lfAct(a,ref){if(a==='Téléverser le document'){let f=document.createElement('input');f.type='file';f.accept='.pdf,.jpg,.jpeg,.png';f.onchange=()=>{if(f.files.length)toast(f.files[0].name+' sélectionné · démonstration sans transfert serveur')};f.click()}else toast(a+' · action enregistrée dans la démonstration · '+ref)}
function lfCreate(a){if(a==='Nouvelle expédition'||a==='Nouvel appel d’offres'){createFor(a);return}modal(a,'<div class="form-grid"><div class="field"><label>Client</label><input placeholder="Nom du chargeur"></div><div class="field"><label>Trajet</label><input placeholder="Départ → destination"></div><div class="field"><label>Marchandise</label><input placeholder="Nature et contraintes"></div><div class="field"><label>Poids / volume</label><input placeholder="tonnes / m³"></div></div>','Enregistrer la demande')}
function lfBind(){
  document.addEventListener('click', event => {
    const point = event.target.closest('[data-lf-chart-week]');
    if (point) lfShowChartPoint(point);
  });
  document.addEventListener('keydown', event => {
    const point = event.target.closest('[data-lf-chart-week]');
    if (point && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      lfShowChartPoint(point);
    }
  });
document.addEventListener('click',e=>{let q=e.target.closest('[data-lf-quick]');if(q){lfFilters.status=lfFilters.status===q.dataset.lfQuick?'':q.dataset.lfQuick;lfFilters.page=1;document.querySelector('#lf-table-root').innerHTML=lfTable();return}let s=e.target.closest('[data-lf-sort]');if(s){let k=s.dataset.lfSort;if(lfFilters.sort===k)lfFilters.direction*=-1;else{lfFilters.sort=k;lfFilters.direction=1}document.querySelector('#lf-table-root').innerHTML=lfTable();return}let p=e.target.closest('[data-lf-pg]');if(p){lfFilters.page=+p.dataset.lfPg;document.querySelector('#lf-table-root').innerHTML=lfTable();return}let a=e.target.closest('[data-lf-act]');if(a){lfAct(a.dataset.lfAct,a.dataset.ref);return}let c=e.target.closest('[data-lf-create]');if(c){lfCreate(c.dataset.lfCreate);return}let r=e.target.closest('[data-lf-row]');if(r){e.preventDefault();lfDrawer(r.dataset.lfRow);return}if(e.target.closest('[data-lf-close]')){document.querySelector('#lf-drawer').innerHTML=''}},true);document.addEventListener('input',e=>{if(e.target.id==='lf-search'){lfFilters.search=e.target.value.toLowerCase();lfFilters.page=1;document.querySelector('#lf-table-root').innerHTML=lfTable()}});document.addEventListener('change',e=>{let m={'lf-status':'status','lf-client':'client','lf-carrier':'carrier','lf-zone':'zone'};if(m[e.target.id]){lfFilters[m[e.target.id]]=e.target.value;lfFilters.page=1;document.querySelector('#lf-table-root').innerHTML=lfTable()}if(e.target.id==='dashboardStart'||e.target.id==='dashboardEnd'){let a=e.target.id==='dashboardStart'?e.target.value:dashboardStart,b=e.target.id==='dashboardEnd'?e.target.value:dashboardEnd;if(a&&b&&a>b){toast('La date de début doit précéder la date de fin');return}dashboardStart=a||dashboardStart;dashboardEnd=b||dashboardEnd;render()}});document.addEventListener('keydown',e=>{if(e.target.matches('[data-lf-row]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();lfDrawer(e.target.dataset.lfRow)}})}
const lfTracking=trackingPage;trackingPage=function(){let h=lfTracking();let europe=lfR.filter(r=>r.zone==='Europe').length,africa=lfR.filter(r=>r.zone==='Afrique subsaharienne').length,national=lfR.filter(r=>r.zone==='National').length;return h.replace('3 Europe · 2 Afrique · 1 locale',europe+' Europe · '+africa+' Afrique · '+national+' nationales')};
lfBind();
shipments.splice(0,shipments.length,...lfR.map(r=>[r.ref,r.route,r.client,r.carrier,lfDate(r.eta),r.status,r.dispatch,r.zone,r.truck,r.pallets+' palettes · '+r.weight+' t · '+r.volume+' m³ · '+r.goods]));
Object.keys(riskDetails).forEach(k=>delete riskDetails[k]);lfAlerts.forEach(a=>riskDetails[a.ref]={label:a.kind,tone:a.severity==='critique'?'red':'orange',description:a.impact,impact:a.impact,reportedAt:'20 nov. 2026',reportedBy:'Suivi LOGIFLOW',action:'Mettre à jour le dossier avec le partenaire',document:'Pièce liée à vérifier'});
offers.forEach((o,i)=>{if(o[6]!=='Attribué'){o[5]=['21 nov. 2026 · 08:00','22 nov. 2026 · 08:00','23 nov. 2026 · 08:00','24 nov. 2026 · 08:00','25 nov. 2026 · 08:00','26 nov. 2026 · 08:00'][i%6];if(o[6]==='Côture proche')o[6]='Ouvert'}});
if(disputes.length){disputes[0][1]='EXP-2026-0844';disputes[0][2]='Document de frontière';disputes[0][4]='En cours'}
lfFilters={status:'',client:'',carrier:'',zone:'',search:'',sort:'dispatch',direction:-1,page:1};selectedShip=0;render();
