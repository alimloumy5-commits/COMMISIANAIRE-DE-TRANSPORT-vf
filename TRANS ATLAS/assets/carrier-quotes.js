const lfOriginalBidsForOffer = bidsForOffer;
const lfOriginalAssignmentPage = assignmentPage;

bidsForOffer = function (offer) {
  const saved = assignedOffers[offer[0]];
  const bids = lfOriginalBidsForOffer(offer);
  const assignedIndex = saved ? bids.findIndex(bid => bid.carrier === saved.carrier) : -1;
  const baseIndex = assignedIndex < 0 ? 0 : assignedIndex;
  const usedPrices = new Set(saved ? [saved.price] : []);
  return bids.map((bid, index) => {
    if (index === assignedIndex) return saved;
    const step = (index - baseIndex + bids.length) % bids.length;
    let adjustment = step * 50;
    while (usedPrices.has(bid.price + adjustment)) adjustment += 50;
    const price = bid.price + adjustment;
    usedPrices.add(price);
    return { ...bid, price, margin: bid.margin - adjustment };
  });
};

function lfTransportQuoteTable(bids) {
  const rows = bids.map((bid, index) => {
    const selected = index === selectedBidIndex;
    return '<tr' + (selected ? ' class="selected"' : '') + '><th scope="row">' +
      '<button type="button" class="text-button" data-row="bid" data-index="' + index + '" aria-pressed="' + selected + '">' +
      esc(bid.carrier) + '</button><br><small>' + esc(bid.vehicle) + '</small></th><td>' +
      esc(bid.price.toLocaleString('fr-FR')) + ' DH HT</td><td>' + esc(bid.eta) + '</td><td>' +
      esc(bid.ontime) + '</td></tr>';
  }).join('');
  return '<div class="table-wrap"><table aria-label="Comparaison des transporteurs"><thead><tr>' +
    ['Transporteur', 'Prix proposé', 'Délai', 'Ponctualité'].map(label => '<th scope="col">' + label + '</th>').join('') +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

assignmentPage = function () {
  const offer = offers.find(row => row[0] === selectedOfferCode) || offers[0];
  return lfOriginalAssignmentPage()
    .replace('Transporteurs compatibles</h3>', 'Comparaison des transporteurs</h3>')
    .replace(/<div class="bid-list">[\s\S]*?(?=<div class="assignment-finance">)/,
      () => lfTransportQuoteTable(bidsForOffer(offer)));
};
