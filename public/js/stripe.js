/* eslint-disable  */
const stripe = Stripe(
  'pk_test_51McBElSHIGVaJ8QRPyrTQoYdrmADNcn3yemai0a3XyjSVUYcfPYtqj2LkT8EVX4t6r5ndgS4upNgNJ564SdASgFN00aOULOxvT'
);

const bookBtn = document.getElementById('book-tour');

const bookTour = async (tourId) => {
  //1. Get checkout session from API
  try {
    console.log({ tourId });
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    //2. Create checkout form + charge the card for us.
  } catch (err) {
    console.log(err.response.data.message);
  }
};

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    console.log({ tourId }, '🤬');
    bookTour(tourId);
  });
}
