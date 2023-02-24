/* eslint-disable  */
const stripe = Stripe(
  'pk_test_51McBElSHIGVaJ8QRPyrTQoYdrmADNcn3yemai0a3XyjSVUYcfPYtqj2LkT8EVX4t6r5ndgS4upNgNJ564SdASgFN00aOULOxvT'
);

const showAlert = (type, msg) => {
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const bookBtn = document.getElementById('book-tour');

const bookTour = async (tourId) => {
  //1. Get checkout session from API
  try {
    console.log({ tourId });
    console.log(
      'Stripe : Developer Testing is under maintanace, please try again later'
    );
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
      headers: { 'Content-Type': 'application/json' },
    });
    // console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    //2. Create checkout form + charge the card for us.
  } catch (err) {
    showAlert('error', err.response.data.message);
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
