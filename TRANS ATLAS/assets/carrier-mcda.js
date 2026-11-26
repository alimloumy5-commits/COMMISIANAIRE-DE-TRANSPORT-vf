const lfOriginalAssignmentPage = assignmentPage;

function lfTransportQuotes(offer, bids) {
  const load = offerLoad(offers.indexOf(offer));
  const needsCold = /frais|frigor|pharma|température/i.test(load.goods + ' ' + offer[3]);
  const quotes = bids.map((bid, index) => {
    const [, hours, minutes] = /^(\d+)\s*h\s*(\d+)?$/.exec(bid.eta || '') || [];
    const duration = Number(hours) + Number(minutes || 0) / 60;
    const punctuality = Number(String(bid.ontime).replace('%', '').trim().replace(',', '.'));
    const issues = [];
    const checks = [];
    if (bid.compatible === false || (bid.payload > 0 && load.tonnes > bid.payload)) issues.push('Capacité insuffisante');
    else if (bid.compatible !== true || !(bid.payload > 0)) checks.push('Capacité à vérifier');
    if (!bid.vehicle) checks.push('Véhicule à vérifier');
    else if (needsCold && !bid.vehicle.endsWith(' · froid')) issues.push('Véhicule sans froid');
    if (bid.availableAtEtd === false) issues.push('Indisponible à l’ETD');
    else if (bid.availableAtEtd !== true) checks.push('Disponibilité à l’ETD à confirmer');
    return { bid, index, duration, punctuality, issues, checks };
  });
  const scored = quotes.filter(({bid, duration, punctuality, issues}) =>
    !issues.length && bid.price > 0 && duration > 0 && punctuality >= 0 && punctuality <= 100 && bid.payload > 0);
  const minPrice = Math.min(...scored.map(({bid}) => bid.price));
  const minDuration = Math.min(...scored.map(({duration}) => duration));
  for (const quote of scored) {
    const { bid, duration, punctuality } = quote;
    quote.criteria = [5 * minPrice / bid.price, 5 * minDuration / duration,
      5 * punctuality / 100, 5 * Math.min(load.tonnes / bid.payload, 1)];
    quote.score = quote.criteria.reduce((total, value, i) => total + value * [.35, .30, .25, .10][i], 0);
  }
  const verified = scored.filter(quote => !quote.checks.length).sort((a, b) => b.score - a.score);
  verified.forEach((quote, i) => { quote.rank = i + 1; });
  return quotes.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || (b.score ?? -1) - (a.score ?? -1));
}

function lfTransportQuoteTable(offer, bids) {
  const format = value => value.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const rows = lfTransportQuotes(offer, bids).map(quote => {
    const {bid, index, issues, checks, score, criteria, rank} = quote;
    const status = issues.length ? 'Incompatible' : checks.length ? 'À vérifier' : 'Compatible';
    const reason = [...issues, ...checks].map(esc).join(' · ');
    return '<tr' + (index === selectedBidIndex ? ' class="selected"' : '') + '><th scope="row">' +
      '<button type="button" class="text-button" data-row="bid" data-index="' + index + '" aria-pressed="' + (index === selectedBidIndex) + '">' +
      esc(bid.carrier) + '</button><br><small>' + esc(bid.vehicle) + '</small></th><td>' +
      esc(bid.price.toLocaleString('fr-FR')) + ' DH HT</td><td>' + esc(bid.eta) + '</td><td>' + esc(bid.ontime) +
      '</td><td><b>' + (score === undefined ? '—' : format(score) + ' / 5') + '</b>' +
      (criteria ? '<details><summary>Détail de la note</summary><ul>' +
      ['Coût', 'Délai', 'Ponctualité', 'Remplissage'].map((label, i) => '<li>' + label + ' ' + format(criteria[i]) + ' / 5</li>').join('') +
      '</ul></details>' : '') + '</td><td>' + status + (reason ? '<br><small>' + reason + '</small>' : '') +
      '</td><td>' + (rank === 1 ? '1 · Recommandé' : rank ?? '—') + '</td></tr>';
  }).join('');
  return '<p id="mcda-weights"><b>Cotation multicritère sur 5</b><br>Coût 35 % · Délai 30 % · Ponctualité 25 % · Remplissage 10 %. ' +
    'La note reste provisoire tant qu’un critère obligatoire est à vérifier.</p>' +
    '<div class="table-wrap"><table aria-label="Comparaison des transporteurs" aria-describedby="mcda-weights"><thead><tr>' +
    ['Transporteur', 'Coût', 'Délai', 'Ponctualité', 'Note sur 5', 'Compatibilité', 'Rang'].map(label => '<th scope="col">' + label + '</th>').join('') +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

assignmentPage = function () {
  const offer = offers.find(row => row[0] === selectedOfferCode) || offers[0];
  return lfOriginalAssignmentPage()
    .replace('Transporteurs compatibles</h3>', 'Comparaison des transporteurs</h3>')
    .replace(/<div class="bid-list">[\s\S]*?(?=<div class="assignment-finance">)/,
      () => lfTransportQuoteTable(offer, bidsForOffer(offer)));
};
