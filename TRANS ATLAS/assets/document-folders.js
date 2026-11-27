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

documentsPage = function () {
  const shipment = lfR.find(row => row.ref === activeDocType);
  if (shipment) {
    const pieces = docs.filter(doc => doc[1] === shipment.ref && doc[5]);
    const labels = {BL:'Bon de livraison', CMR:'Lettre de voiture CMR', Colisage:'Liste de colisage', DUM:'Déclaration douanière', Temperature:'Relevé de température', Conformite:'Certificat de conformité', Phytosanitaire:'Certificat phytosanitaire', 'Facture-commerciale':'Facture commerciale', 'Facture-transport':'Facture de transport'};
    const cards = pieces.map(doc => {
      const type = doc[0].split('-EXP-')[0];
      const label = esc(labels[type] || type);
      const image = esc(doc[5]);
      const pdf = esc(doc[5].replace(/\.png$/, '.pdf'));
      return `<article class="card"><div class="card-head"><h3>${label}</h3><a class="small-button" href="${pdf}" download>Télécharger en PDF</a></div><details><summary>Aperçu du document</summary><img loading="lazy" style="display:block;width:100%;height:auto" src="${image}" alt="${label} · ${esc(shipment.ref)}"><a class="small-button" href="${image}" download>Télécharger en PNG</a></details></article>`;
    }).join('');
    return `<button class="text-button" data-document-folder="Tous">← Toutes les expéditions</button>${title('Documents · '+esc(shipment.ref),esc(shipment.route)+' · '+esc(shipment.client))}<div class="document-pieces">${cards || '<p>Aucun document rattaché à cette expédition.</p>'}</div>`;
  }
  const cards = lfR.map(row => {
    const n = docs.filter(doc => doc[1] === row.ref && doc[5]).length;
    return `<button type="button" class="card folder" style="text-align:left;cursor:pointer" data-document-folder="${esc(row.ref)}"><small>${esc(row.ref)}</small><b>${esc(row.route)}</b><span>${esc(row.client)}</span><small>${n} document${n===1?'':'s'}</small></button>`;
  }).join('');
  const loose = docs.filter(doc => !lfR.some(row => row.ref === doc[1]));
  const others = loose.length ? `<section class="card"><h3>Documents hors expédition</h3>${loose.map(doc => `<button class="text-button" data-loose-document="${docs.indexOf(doc)}">${esc(doc[0])} · ${esc(doc[1])}</button>`).join('')}</section>` : '';
  return `${title('Documents','Sélectionnez une expédition pour consulter ses pièces.','Importer un document')}<div class="folder-grid">${cards}</div>${others}`;
}

document.addEventListener('click', event => {
  const folder = event.target.closest('[data-document-folder]');
  if (folder) openDocumentFolder(folder.dataset.documentFolder);
  const loose = event.target.closest('[data-loose-document]');
  if (loose) {
    const doc = docs[Number(loose.dataset.looseDocument)];
    if (doc) modal(doc[0], documentPreview(doc), 'Fermer');
  }
});

