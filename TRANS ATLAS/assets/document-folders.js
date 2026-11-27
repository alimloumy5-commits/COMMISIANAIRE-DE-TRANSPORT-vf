for (let index = docs.length - 1; index >= 0; index--) {
  if (['Contrats', 'Preuves de livraison'].includes(docs[index][4])) docs.splice(index, 1);
}

function openDocumentFolder(ref) {
  const previous = navigationState();
  if (previous.page === 'documents' && previous.activeDocType === ref) return;
  navigationHistory[navigationIndex] = previous;
  activeDocType = ref;
  page = 'documents';
  query = '';
  activeTab = '';
  navigationHistory.splice(++navigationIndex, navigationHistory.length, navigationState());
  showNavigationPage();
}

const navigateBeforeDocumentFolders = go;
go = function (destination) {
  if (destination === 'documents') openDocumentFolder('Tous');
  else navigateBeforeDocumentFolders(destination);
};

const showShipmentDrawer = lfDrawer;
lfDrawer = function (ref) {
  showShipmentDrawer(ref);
  const drawer = document.querySelector('.lf-drawer-panel');
  const heading = drawer && [...drawer.querySelectorAll('h3')].find(h => h.textContent.includes('documents'));
  const description = heading?.nextElementSibling?.nextElementSibling;
  if (description?.tagName === 'P') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    button.dataset.documentFolder = ref;
    button.textContent = folderLabel(ref);
    description.replaceWith(button);
  }
};

const pageSize = 5;
let libraryPage = 1;
let libraryFilter = '';
let libraryFormat = '';

function shipmentSection() {
    const cards = lfR.map(row => {
      const n = shipmentPieces(row.ref).length;
      return `<button class="card folder" type="button" data-document-folder="${esc(row.ref)}"><small>${esc(row.ref)}</small><b>${esc(row.route)}</b><span>${esc(row.client)}</span><small>${n} documents</small></button>`;
    }).join('');

  return `<section aria-label="Documents par expédition"><h2>Documents par expédition</h2><div class="folder-grid">${cards}</div></section>`;
}

function libraryRows(root) {
  const layout = root.querySelector('.doc-layout');
  const pager = layout?.querySelector('[data-doc-pager]');
  if (!pager) return;
  const list = activeDocType === 'Tous' ? docs : docs.filter(d => d[4] === activeDocType);
  const search = (query || '').toLocaleLowerCase('fr');
  const matches = list.map((d,index) => ({d,index})).filter(({d}) =>
    d.slice(0,5).join(' ').toLocaleLowerCase('fr').includes(search) &&
    (!libraryFormat || d[3] === libraryFormat || (libraryFormat === 'PDF' && d[5]))
  );
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  libraryPage = Math.max(1, Math.min(libraryPage, pages));
  const visible = matches.slice((libraryPage-1)*pageSize, libraryPage*pageSize);
  const box = layout.querySelector('.table-wrap');
  const temp = document.createElement('template');
  temp.innerHTML = table(['Nom du document','Dossier lié','Ajouté le','Type'],visible.map(({d})=>[d[0],d[1],d[2],d[4]]),'docs');
  temp.content.querySelectorAll('tbody tr').forEach((row,i)=>row.dataset.index = visible[i].index);
  box.replaceWith(temp.content);
  layout.querySelector('.badge').textContent = matches.length + ' documents';
  pager.innerHTML = `<button type="button" class="secondary" data-doc-step="-1" ${libraryPage===1?'disabled':''}>Précédent</button> <span aria-live="polite">Page ${libraryPage} sur ${pages}</span> <button type="button" class="secondary" data-doc-step="1" ${libraryPage===pages?'disabled':''}>Suivant</button>`;
  const select=layout.querySelector('select.search-field');
  if (select) select.selectedIndex=libraryFormat ? [...select.options].findIndex(o=>o.text===libraryFormat) : 0;
}

const renderDocumentLibrary = documentsPage;
documentsPage = function () {
  const shipment = lfR.find(row => row.ref === activeDocType);
  const template = document.createElement('template');
  template.innerHTML = renderDocumentLibrary();
  const root = template.content;
  root.querySelectorAll('[data-folder="Contrats"], [data-folder="Preuves de livraison"]').forEach(tile => tile.remove());
  if (!shipment) {
    if (libraryFilter !== activeDocType) {
      libraryFilter = activeDocType;
      libraryPage = 1;
      libraryFormat = '';
    }
    const layout=root.querySelector('.doc-layout');
    layout.querySelector('.table-wrap').insertAdjacentHTML('afterend','<nav data-doc-pager aria-label="Pages des documents" style="display:flex;align-items:center;gap:.6rem;margin:.8rem 0"></nav>');
    libraryRows(root);
    layout.insertAdjacentHTML('afterend', shipmentSection());
    return template.innerHTML;
  }
  const pieces = shipmentPieces(shipment.ref);
  const selected = pieces.includes(docs[selectedDocument]) ? docs[selectedDocument] : pieces[0];
  const layout = root.querySelector('.doc-layout');
  const list = layout.firstElementChild;
  const preview = layout.querySelector('.doc-view');
  list.querySelector('h3').textContent = 'Documents de l’expédition';
  list.querySelector('.badge').textContent = pieces.length + ' pièces';
  const tableBox = list.querySelector('.table-wrap');
  tableBox.outerHTML = table(['Nom du document','Dossier lié','Ajouté le','Type'], pieces.map(d=>[d[0],d[1],d[2],d[4]]),'shipment-doc');
  list.querySelectorAll('tbody tr').forEach((tr,i) => {
    tr.dataset.pieceIndex = docs.indexOf(pieces[i]);
    tr.removeAttribute('data-row');
    tr.classList.toggle('selected',pieces[i] === selected);
  });
  if (selected) {
    const path = esc(selected[5]);
    preview.innerHTML = `<div class="card-head"><div><h3>Aperçu du document</h3><small>${esc(selected[0])}</small></div><div><a class="small-button" href="${esc(selected[5].replace(/\.png$/,'.pdf'))}" download>Télécharger en PDF</a> <a class="small-button" href="${path}" download>PNG</a></div></div>${documentPreview(selected)}`;
  } else preview.textContent = 'Aucune pièce disponible pour cette expédition.';
  return `<button class="text-button" data-document-folder="Tous">← Retour à la bibliothèque</button>${title(esc(shipment.ref),esc(shipment.route)+' · '+esc(shipment.client))}${layout.outerHTML}`;
};

document.addEventListener('click', event => {
  const folder = event.target.closest('[data-document-folder]');
  if (folder) openDocumentFolder(folder.dataset.documentFolder);
  const row = event.target.closest('[data-piece-index]');
  if (row) {
    selectedDocument = Number(row.dataset.pieceIndex);
    const doc = docs[selectedDocument];
    if (event.detail >= 2) modal(doc[0], documentPreview(doc), 'Fermer');
    else render();
  }
});

document.addEventListener('click', event => {
  const step = event.target.closest('[data-doc-step]');
  if (step) {
    libraryPage += Number(step.dataset.docStep);
    libraryRows(document);
  }
});
for (const action of ['input','change']) {
  document.addEventListener(action, event => {
    if (!event.target.closest('.doc-layout') || !document.querySelector('[data-doc-pager]')) return;
    if (event.target.matches('.local-search')) query = event.target.value;
    else if (event.target.matches('select.search-field')) libraryFormat = event.target.selectedIndex ? event.target.value : '';
    else return;
    libraryPage = 1;
    libraryRows(document);
  });
}

function shipmentPieces(ref) {
  return docs.filter(doc => doc[1] === ref && doc[5]);
}

function folderLabel(ref) {
  const n = shipmentPieces(ref).length;
  return 'Documents de l’expédition (' + n + ')';
}

function folderLink(ref, withReference = false) {
  const label = (withReference ? ref + ' · ' : '') + folderLabel(ref);
  return `<button type="button" class="text-button" data-document-folder="${esc(ref)}">${esc(label)}</button>`;
}

function pieceSummary(ref) {
  const names = { BL:'Bon de livraison', Colisage:'Liste de colisage', CMR:'CMR', DUM:'DUM',
    'Facture-commerciale':'Facture commerciale', 'Facture-transport':'Facture de transport',
    Temperature:'Relevé de température', Conformite:'Certificat de conformité', Phytosanitaire:'Certificat phytosanitaire' };
  return shipmentPieces(ref).map(d => names[d[0].split('-EXP-')[0]] || d[4]).join(' · ') || 'Aucune pièce rattachée';
}

function associatedDocuments(panel, rows) {
  if (!panel || !rows.length) return;
  panel.insertAdjacentHTML('beforeend', '<div class="detail-row"><span>Documents des expéditions</span><div>' +
    rows.map(row => folderLink(row.ref, true)).join('<br>') + '</div></div>');
}

function namedField(root, label) {
  return [...root.querySelectorAll('.detail-row, .shipment-facts > div')].find(row =>
    row.firstElementChild?.textContent.trim() === label);
}

const alertWithHistory = lfAlertWorkflow;
lfAlertWorkflow = function(alert) {
  return alertWithHistory(alert) + folderLink(alert.ref);
};

const renderBeforeDocumentLinks = render;
render = function() {
  renderBeforeDocumentLinks();
  const root = document.getElementById('app');
  if (page === 'tracking') {
    const ref = shipments[selectedShip]?.[0];
    if (!ref) return;
    const field = namedField(root,'Documents');
    if (field) field.lastElementChild.textContent = pieceSummary(ref);
    const button = root.querySelector('.shipment-footer [data-page="documents"]');
    if (button) {
      button.removeAttribute('data-page');
      button.dataset.documentFolder = ref;
      button.textContent = folderLabel(ref);
    }
  } else if (page === 'assignment') {
    const field = namedField(root,'Documents');
    const row = lfR.find(r => r.offerCode === selectedOfferCode);
    if (field) field.lastElementChild.innerHTML = row ? folderLink(row.ref) : 'Aucune expédition rattachée';
    else if (row) associatedDocuments(root.querySelector('.assignment-summary'),[row]);
  } else if (page === 'clients' || page === 'carriers' || page === 'shippers') {
    const panel = root.querySelector('.client-profile, .card.detail');
    const partner = panel?.querySelector('h2')?.textContent.trim() ||
      root.querySelector('tr.selected[data-row="carriers"] td')?.textContent.trim();
    const key = page === 'carriers' ? 'carrier' : 'client';
    associatedDocuments(panel || root.querySelector('.two-col > .card:last-child'),lfR.filter(r => r[key] === partner));
  } else if (page === 'disputes') {
    const panel = root.querySelector('.card.detail');
    const id = panel?.querySelector('.card-head .link')?.textContent.trim();
    const dispute = disputes.find(d => d[0] === id);
    const row = lfR.find(r => r.ref === dispute?.[1]);
    if (row) {
      const evidence = namedField(panel,'Éléments associés');
      if (evidence) evidence.lastElementChild.innerHTML = folderLink(row.ref);
    }
  } else if (page === 'billing') {
    const panel = root.querySelector('.bill-preview');
    const id = panel?.querySelector('.invoice-heading b')?.textContent.trim();
    const row = lfR.find(r => r.invoiceRef && r.invoiceRef === id);
    if (row) associatedDocuments(panel,[row]);
  }
};

const modalBeforeDocumentLinks = modal;
modal = function(heading,body,submit) {
  modalBeforeDocumentLinks(heading,body,submit);
  const panel = document.querySelector('#modalRoot .modal-body');
  if (!panel) return;
  const dispute = disputes.find(d => heading.startsWith(d[0]));
  const ref = dispute?.[1] || heading.match(/EXP-\d{4}-\d+/)?.[0];
  if (!lfR.some(r => r.ref === ref)) return;
  const field = namedField(panel,'Document concerné') || namedField(panel,'Preuves');
  if (field) field.lastElementChild.innerHTML = folderLink(ref);
};
document.addEventListener('click', event => {
  if (event.target.closest('#modalRoot [data-document-folder]')) {
    const ref = event.target.closest('[data-document-folder]').dataset.documentFolder;
    event.stopPropagation();
    document.getElementById('modalRoot').replaceChildren();
    openDocumentFolder(ref);
  }
},true);
render();
