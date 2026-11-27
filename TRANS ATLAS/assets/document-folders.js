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
    button.textContent = 'Documents de cette expédition';
    description.replaceWith(button);
  }
};

const renderDocumentLibrary = documentsPage;
documentsPage = function () {
  const shipment = lfR.find(row => row.ref === activeDocType);
  if (activeDocType === 'expeditions') {
    const cards = lfR.map(row => {
      const n = docs.filter(doc => doc[1] === row.ref && doc[5]).length;
      return `<button class="card folder" type="button" data-document-folder="${esc(row.ref)}"><small>${esc(row.ref)}</small><b>${esc(row.route)}</b><span>${esc(row.client)}</span><small>${n} documents</small></button>`;
    }).join('');
    return `<button class="text-button" data-document-folder="Tous">← Bibliothèque documentaire</button>${title('Documents par expédition','Sélectionnez une expédition pour consulter ses pièces.')}<div class="folder-grid">${cards}</div>`;
  }
  const template = document.createElement('template');
  template.innerHTML = renderDocumentLibrary();
  const root = template.content;
  root.querySelectorAll('[data-folder="Contrats"], [data-folder="Preuves de livraison"]').forEach(tile => tile.remove());
  if (!shipment) {
    root.querySelector('[data-folder="Tous"]').insertAdjacentHTML('afterend','<button class="text-button" data-document-folder="expeditions">Documents par expédition</button>');
    return template.innerHTML;
  }
  const pieces = docs.filter(doc => doc[1] === shipment.ref && doc[5]);
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
  return `<button class="text-button" data-document-folder="expeditions">← Toutes les expéditions</button>${title(esc(shipment.ref),esc(shipment.route)+' · '+esc(shipment.client))}${layout.outerHTML}`;
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
