const lfOriginalBidsForOffer = bidsForOffer;
const lfOriginalAssignmentPage = assignmentPage;

bidsForOffer = function (offer) {
  const saved = assignedOffers[offer[0]];
  const bids = lfOriginalBidsForOffer(offer);
  const assignedIndex = saved ? bids.findIndex(bid => bid.carrier === saved.carrier) : -1;
  const pricePremiums = [.8, .55, .65, .25, 0];
  const usedPrices = new Set(saved ? [saved.price] : []);
  return bids.map((bid, index) => {
    if (index === assignedIndex) return saved;
    let adjustment = Math.round(bid.margin * (pricePremiums[index] ?? 0));
    while (usedPrices.has(bid.price + adjustment)) adjustment += 1;
    const price = bid.price + adjustment;
    usedPrices.add(price);
    // Scénario de démonstration. Une disponibilité renseignée a priorité.
    const demoAvailability = [true, true, undefined, undefined, false];
    const availableAtEtd = bid.availableAtEtd ?? demoAvailability[index];
    return { ...bid, price, margin: bid.margin - adjustment, availableAtEtd };
  });
};

const lfOriginalConfirmAssignment = confirmAssignment;
let lfManualCarrierChoice;

document.addEventListener('click', event => {
  if (event.target.closest('[data-offer-open], [data-page="offers"]')) lfManualCarrierChoice = undefined;
  const choice = event.target.closest('.lf-carrier-quotes [data-row="bid"]');
  if (page === 'assignment' && choice) {
    lfManualCarrierChoice = { offer: selectedOfferCode, index: Number(choice.dataset.index) };
  }
}, true);

confirmAssignment = function () {
  if (lfManualCarrierChoice?.offer !== selectedOfferCode || lfManualCarrierChoice.index !== selectedBidIndex) {
    toast('Choisis un transporteur avant de confirmer.');
    return;
  }
  return lfOriginalConfirmAssignment();
};

function lfTransportQuoteTable(bids, selectedIndex, assigned) {
  const rows = bids.map((bid, index) => {
    const selected = index === selectedIndex;
    const availability = bid.availableAtEtd === true ? ['Confirmée', 'confirmed'] :
      bid.availableAtEtd === false ? ['Indisponible', 'unavailable'] : ['À confirmer', 'pending'];
    return '<tr' + (selected ? ' class="lf-quote-selected"' : '') + '><th scope="row"><strong>' +
      esc(bid.carrier) + '</strong><small>' + esc(bid.vehicle) + '</small></th><td class="lf-quote-price">' +
      esc(bid.price.toLocaleString('fr-FR')) + ' DH HT</td><td><span class="lf-quote-status ' + availability[1] + '">' +
      availability[0] + '</span></td><td>' + esc(bid.eta) + '</td><td>' + esc(bid.ontime) + '</td>' +
      (assigned ? '' : '<td><button type="button" class="lf-quote-choice" data-row="bid" data-index="' + index +
        '" aria-pressed="' + selected + '" aria-label="Choisir ' + esc(bid.carrier) + '">' +
        (selected ? 'Sélectionné' : 'Choisir') + '</button></td>') + '</tr>';
  }).join('');
  const headings = ['Transporteur', 'Prix proposé', 'Disponibilité à l’ETD', 'Délai', 'Ponctualité'];
  if (!assigned) headings.push('Sélection');
  return '<p><small>Disponibilités à l’ETD simulées pour la démonstration.</small></p><div class="table-wrap lf-carrier-quotes"><table aria-label="Comparaison des transporteurs"><thead><tr>' +
    headings.map(label => '<th scope="col">' + label + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

assignmentPage = function () {
  const offer = offers.find(row => row[0] === selectedOfferCode) || offers[0];
  const saved = assignedOffers[offer[0]];
  const bids = bidsForOffer(offer);
  const manualIndex = lfManualCarrierChoice?.offer === offer[0] ? lfManualCarrierChoice.index : -1;
  const selectedIndex = saved ? bids.findIndex(bid => bid.carrier === saved.carrier) : manualIndex;
  let html = lfOriginalAssignmentPage()
    .replace('Affectation automatique', 'Choix du transporteur')
    .replace('Transporteurs compatibles</h3>', 'Comparaison des transporteurs</h3>')
    .replace(/<div class="bid-list">[\s\S]*?(?=<div class="assignment-finance">)/,
      () => lfTransportQuoteTable(bids, selectedIndex, Boolean(saved)));
  if (!saved && !bids[manualIndex]) {
    html = html.replace(/<div class="assignment-finance">[\s\S]*?(?=<div class="bid-selection">)/, '')
      .replace('<button class="primary" data-action="Confirmer l’attribution">', '<button class="primary" data-action="Confirmer l’attribution" disabled>')
      .replace(/<div class="card"><h3>Capacités et contrôle<\/h3>[\s\S]*$/, '');
  }
  return html;
};
