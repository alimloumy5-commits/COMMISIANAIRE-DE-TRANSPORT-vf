const lfLegacyDocumentsPage = documentsPage;
const lfDemoTransportPdfs = [
  ['ordre-transport', 'Ordre de transport', 'Attribution', 'Commissionnaire', ['Mission : AO-2026-126 / DEMO-ANV-001', 'Transporteur désigné : Nord Cargo (scénario)', 'Enlèvement : Agadir, 21/11/2026 à 08:00', 'Livraison prévue : Anvers, 24/11/2026 à 14:00', 'Véhicule : semi-remorque frigorifique', 'Consigne : +4 °C. Contrôler le scellé avant départ.']],
  ['bon-chargement', 'Bon de chargement', 'Chargement', 'Site de départ', ['Chargement terminé : 21/11/2026 à 08:20', 'Véhicule fictif : DEMO-126', 'Quantité chargée : 18 palettes / 720 cartons', 'État apparent : emballages intacts', 'Scellé : DEMO-S001', 'Pointage et visa : simulation']],
  ['cmr', 'Lettre de voiture CMR', 'Prise en charge', 'Expéditeur et transporteur', ['Référence : CMR-DEMO-126', 'Expéditeur : Fresh Export Démo, quai fictif, Agadir', 'Transporteur : Nord Cargo Démo, agence fictive, Agadir', 'Destinataire : Réception Anvers Démo, quai fictif, Anvers', 'Prise en charge : Agadir, 21/11/2026 à 08:20', 'Livraison convenue : Anvers, 24/11/2026 à 14:00', 'Emballage : 720 cartons sur 18 palettes', 'Consigne : +4 °C. Scellé : DEMO-S001.', 'Pièces remises : facture et liste de colisage démo.', 'Visas expéditeur et transporteur : simulation']],
  ['pod', 'Preuve de livraison (POD)', 'Livraison', 'Destinataire', ['Réception : Anvers, 24/11/2026 à 13:45', 'Quantité reçue : 18 palettes / 720 cartons', 'Scellé DEMO-S001 : intact à la réception', 'Réserves : aucune dans ce scénario', 'Réceptionnaire : équipe quai démo', 'Visa de réception : simulation']],
  ['facture', 'Facture commerciale', 'Dossier commercial', 'Vendeur', ['Facture : DEMO-F126 du 20/11/2026', 'Vendeur : Fresh Export Démo, Agadir', 'Acheteur : Réception Anvers Démo, Anvers', '720 cartons d’agrumes à 20 EUR : 14 400 EUR', 'Devise : EUR. Incoterm du scénario : DAP Anvers.']],
  ['colisage', 'Liste de colisage', 'Préparation', 'Expéditeur', ['Palettes P01 à P18 : 40 cartons par palette', 'Total : 18 palettes / 720 cartons', 'Poids net total : 10 800 kg', 'Poids brut total : 12 000 kg', 'Lot de démonstration : AGR-126']],
  ['declaration', 'Déclaration douanière (DUM)', 'Douane export', 'Déclarant', ['Référence fictive : DEMO-DUM-126', 'Flux simulé : export Maroc vers Belgique', 'Bureau du scénario : Agadir', 'Pièces associées : DEMO-F126 et liste de colisage', 'Statut de scénario : mainlevée illustrative']],
  ['origine', 'Preuve d’origine', 'Dossier douanier', 'Exportateur', ['Référence fictive : DEMO-ORIG-126', 'Produit : agrumes, lot AGR-126', 'Origine déclarée dans le scénario : Maroc', 'Facture de référence : DEMO-F126', 'Exemple pédagogique sans certification']],
  ['transit', 'Document de transit', 'Transit douanier', 'Titulaire du transit', ['Référence fictive : DEMO-TR-126', 'Segment illustratif : Algeciras vers Anvers', 'Départ de transit simulé : 22/11/2026', 'Arrivée simulée : 24/11/2026', 'Scellé : DEMO-S001. Clôture : simulation.']],
  ['temperature', 'Relevé de température', 'Transport', 'Transporteur', ['Capteur fictif : DEMO-T126. Consigne : +4 °C.', '21/11/2026 à 08:30 : +4,1 °C', '22/11/2026 à 12:00 : +3,9 °C', '23/11/2026 à 12:00 : +4,2 °C', '24/11/2026 à 13:40 : +4,0 °C', 'Pas d’écart relevé dans les mesures d’exemple.']],
  ['phytosanitaire', 'Certificat phytosanitaire', 'Contrôle avant départ', 'Organisme de contrôle', ['Référence fictive : DEMO-PHYTO-126', 'Produit : agrumes frais, lot AGR-126', 'Origine du scénario : Maroc. Destination : Belgique.', 'Quantité : 720 cartons / 10 800 kg nets', 'Inspection illustrative : 20/11/2026', 'Organisme et visa : simulation pédagogique']],
  ['adr', 'Document de transport ADR', 'Prise en charge', 'Expéditeur ADR', ['Scénario séparé : Casablanca vers Tanger', 'Référence fictive : DEMO-ADR-001', 'Expéditeur : Démo Peintures, Casablanca', 'Destinataire : Démo Réception, Tanger', 'Exemple de désignation : UN 1263, PEINTURES, 3, III', 'Conditionnement illustratif : 4 fûts de 20 L', 'Quantité totale : 80 L. Aucun visa réel.']],
];

function lfDemoPdf(documentRow) {
  const [id, label, step, provider, details] = documentRow;
  const dossier = id === 'adr' ? 'DEMO-ADR-001 | Casablanca - Tanger' : 'DEMO-ANV-001 | Agadir - Anvers';
  const literal = value => value.replace(/[^\x20-\x7e]|[\\()]/g, character => {
    if ('\\()'.includes(character)) return '\\' + character;
    const cp = character === '’' ? 146 : character.charCodeAt(0);
    return cp <= 255 ? '\\' + cp.toString(8).padStart(3, '0') : '-';
  });
  const lines = [dossier, 'Étape : ' + step, 'Émetteur : ' + provider, '', ...details];
  if (id !== 'adr') lines.push('', 'Marchandise : agrumes frais | 18 palettes | 12 000 kg brut');
  const stream = '0.08 0.35 0.27 rg 44 705 507 88 re f\n' +
    'BT /F1 12 Tf 1 1 1 rg 60 765 Td (LOGIFLOW) Tj /F1 24 Tf 0 -34 Td (' + literal(label) + ') Tj ET\n' +
    'BT /F1 12 Tf 0.10 0.19 0.16 rg 60 669 Td 24 TL ' +
    lines.map((line, index) => (index ? 'T* ' : '') + '(' + literal(line) + ') Tj').join('\n') + ' ET\n' +
    'BT /F1 11 Tf 0.50 0.15 0.10 rg 60 64 Td (' + literal('DÉMONSTRATION — document fictif, sans valeur officielle.') + ') Tj ET\n';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream'];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, i) => {
    const offset = pdf.length;
    pdf += (i + 1) + ' 0 obj\n' + object + '\nendobj\n';
    return offset;
  });
  const xref = pdf.length;
  return pdf + 'xref\n0 6\n0000000000 65535 f \n' +
    offsets.map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('') +
    'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
}
const lfDemoPdfUrls = new Map();
documentsPage = function () {
  const section = (caption, rows) => '<section class="card"><h3>' + caption + '</h3><div class="table-wrap"><table><thead><tr>' +
    ['Document', 'Étape', 'À fournir par', 'PDF'].map(heading => '<th scope="col">' + heading + '</th>').join('') +
    '</tr></thead><tbody>' + rows.map(row => {
      const [id, label, step, provider] = row;
      if (!lfDemoPdfUrls.has(id)) lfDemoPdfUrls.set(id, URL.createObjectURL(new Blob([lfDemoPdf(row)], {type:'application/pdf'})));
      const url = lfDemoPdfUrls.get(id);
      return '<tr><th scope="row">' + esc(label) + '</th><td>' + esc(step) + '</td><td>' + esc(provider) +
        '</td><td><a href="' + url + '" target="_blank" rel="noopener">Consulter</a> · <a href="' + url +
        '" download="LOGIFLOW-DEMO-' + id + '.pdf">Télécharger</a></td></tr>';
    }).join('') + '</tbody></table></div></section>';
  const demo = '<h2>Dossiers de démonstration</h2>' +
    section('Agadir → Anvers · AO-2026-126 · DEMO-ANV-001', lfDemoTransportPdfs.filter(row => row[0] !== 'adr')) +
    section('Casablanca → Tanger · DEMO-ADR-001', lfDemoTransportPdfs.filter(row => row[0] === 'adr'));
  return lfLegacyDocumentsPage().replace('<div class="folder-grid">', () => demo + '<div class="folder-grid">');
};
