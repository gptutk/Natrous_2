/* eslint-disable  */
var stripe = Stripe(
  'pk_test_51McBElSHIGVaJ8QRPyrTQoYdrmADNcn3yemai0a3XyjSVUYcfPYtqj2LkT8EVX4t6r5ndgS4upNgNJ564SdASgFN00aOULOxvT'
);
var bookBtn = document.getElementById('book-tour');

var bookTour = function bookTour(tourId) {
  var session;
  return regeneratorRuntime.async(
    function bookTour$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.prev = 0;
            console.log({
              tourId: tourId,
            });
            _context.next = 4;
            return regeneratorRuntime.awrap(
              axios({
                method: 'GET',
                url: 'http://127.0.0.1:8000/api/v1/bookings/checkout-session/'.concat(
                  tourId
                ),
                headers: {
                  'Content-Type': 'application/json',
                },
              })
            );

          case 4:
            session = _context.sent;
            console.log(session); //2. Create checkout form + charge the card for us.

            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](0);
            console.log(_context.t0.response.data.message);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    },
    null,
    null,
    [[0, 8]]
  );
};

if (bookBtn) {
  bookBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    var tourId = e.target.dataset.tourId;
    console.log(
      {
        tourId: tourId,
      },
      '🤬'
    );
    bookTour(tourId);
  });
}
