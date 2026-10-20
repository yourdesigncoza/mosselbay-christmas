/* Everything you might want to change lives here: dates, rates, bookings, contact, photos, places.
   Dates are YYYY-MM-DD. After editing, commit and push; the page and the card update themselves. */
window.SITE = {
  // Guests can arrive from firstNight and must leave by lastCheckOut. No stay is longer than maxNights.
  season: { firstNight: '2026-12-19', lastCheckOut: '2027-01-04', maxNights: 14 },

  // Each rate runs from its minNights up to the next rate; the last one up to maxNights.
  // The shortest stay is the smallest minNights.
  rates: [
    { minNights: 12, perNight: 3200 },
    { minNights: 14, perNight: 3000 },
  ],

  // Confirmed bookings: guests arrive on "from" and leave on "to", e.g. { from: '2026-12-19', to: '2027-01-02' }.
  booked: [],

  // ref is added as the last line of every WhatsApp and email enquiry. Leave it empty ('') to drop it.
  contact: { phone: '084 868 2186', email: 'marisajansevanvuuren3@gmail.com', ref: 'KLIPPER-CARD' },

  // Gallery order, as a walk through the house. "wide" photos take a full row on phones and a 2x2 block on
  // computers; keep the plain photos between wide ones in multiples of 4 so the grid has no gaps. A wide photo placed last becomes a full-width banner.
  photos: [
    { src: 'front', caption: 'Double garage, plus parking behind the electric gate', wide: true },
    { src: 'entrance', caption: 'Front door' },
    { src: 'hallway', caption: 'Entrance hall, through to the dining room' },
    { src: 'dining', caption: 'Dining table' },
    { src: 'kitchen', caption: 'Kitchen' },
    { src: 'tv-lounge', caption: 'TV lounge' },
    { src: 'tv-lounge-2', caption: 'TV lounge, from the other side' },
    { src: 'lounge-dining', caption: 'Lounge and dining room, facing the bay', wide: true },
    { src: 'study', caption: 'Study with a sleeper couch and a sea view' },
    { src: 'stoep', caption: 'The stoep, through to the study' },
    { src: 'stoep-view', caption: 'The view from the stoep, over the harbour', wide: true },
    { src: 'bedroom-1', caption: 'Bedroom 1, double bed' },
    { src: 'bedroom-1b', caption: 'Bedroom 1, another angle' },
    { src: 'bedroom-2', caption: 'Bedroom 2, double bed' },
    { src: 'bedroom-2b', caption: 'Bedroom 2, window over the bay' },
    { src: 'bathroom', caption: 'Bathroom with shower' },
    { src: 'bathroom-2', caption: 'Second bathroom, with a shower and bath' },
    { src: 'back-stoep', caption: 'Back stoep with a sea view' },
    { src: 'braai', caption: 'Built-in braai on the back stoep' },
  ],

  // The house pin sits on Klipper Street; the exact address is shared once guests book.
  home: { name: 'The house', lat: -34.18522, lng: 22.14372, label: 'e' },

  // Map pins and the "around the bay" list, nearest first. kind: beach | food | see.
  // label = which side of the pin the name sits on (n, s, e, w). Drive times are from the house.
  places: [
    {
      id: 'dias', name: 'Dias Museum', kind: 'see', lat: -34.18039, lng: 22.14210, label: 'w',
      km: 0.8, drive: 2,
      about: 'Climb aboard a full-size replica of Bartolomeu Dias’s caravel, then post a card at the Post Office Tree, where Portuguese sailors left letters in 1500.',
      picks: [{ name: 'Cape St Blaize Distillery', note: 'small-batch gin in the museum grounds' }],
      query: 'Dias Museum Complex Mossel Bay',
    },
    {
      id: 'harbour', name: 'The Harbour', kind: 'see', lat: -34.17834, lng: 22.14288, label: 'e',
      km: 1.1, drive: 3,
      about: 'Boats leave the quay for Seal Island, about an hour out among the fur seals.',
      picks: [
        { name: 'Romonza Boat Trips', note: 'Seal Island trips' },
        { name: 'Kaai 4', note: 'open-fire braai food on the harbour beach' },
      ],
      query: 'Romonza Boat Trips Mossel Bay',
    },
    {
      id: 'hussar', name: 'The Hussar Grill', kind: 'food', lat: -34.1832, lng: 22.1524, label: 'n',
      km: 1.1, drive: 3,
      about: 'Steakhouse in a historic sandstone building on Marsh Street.',
      query: 'The Hussar Grill Mossel Bay',
    },
    {
      id: 'point', name: 'The Point', kind: 'see', lat: -34.18611, lng: 22.15637, label: 'n',
      km: 2, drive: 4,
      about: 'Cape St Blaize lighthouse (1864) stands above a Stone Age cave. The St Blaize Trail starts here and follows the cliffs west.',
      picks: [
        { name: 'Minnesota Spur', note: 'steak, burgers and ribs; good for kids' },
        { name: 'Coffee@Work OppiPunt', note: 'coffee with a sea view' },
        { name: 'Big Blu', note: 'bar and restaurant' },
      ],
      query: 'Cape St Blaize Lighthouse Mossel Bay',
    },
    {
      id: 'santos', name: 'Santos Beach', kind: 'beach', lat: -34.17706, lng: 22.13806, label: 'w',
      km: 1.8, drive: 4,
      about: 'Sheltered, calm water right beside the harbour. A favourite with families.',
      query: 'Santos Beach Mossel Bay',
    },
    {
      id: 'debakke', name: 'De Bakke Beach', kind: 'beach', lat: -34.17307, lng: 22.12979, label: 's',
      km: 2.3, drive: 4,
      about: 'Blue Flag beach for 2025/26, next door to Santos.',
      query: 'De Bakke Beach Mossel Bay',
    },
    {
      id: 'mall', name: 'Mossel Bay Mall', kind: 'see', lat: -34.18484, lng: 22.11555,
      km: 3.4, drive: 5,
      about: 'The nearest big shopping centre.',
      query: 'Mossel Bay Mall',
    },
    {
      id: 'casino', name: 'Garden Route Casino', kind: 'see', lat: -34.19593, lng: 22.09153,
      km: 7, drive: 10,
      about: 'Restaurants, shows and a spa at Pinnacle Point. 18+ to gamble.',
      query: 'Garden Route Casino Mossel Bay',
    },
    {
      id: 'diaz', name: 'Diaz Beach', kind: 'beach', lat: -34.14072, lng: 22.11252,
      km: 8.4, drive: 10,
      about: 'A long, open beach towards Hartenbos, made for long walks.',
      query: 'Diaz Beach Mossel Bay',
    },
  ],
};
