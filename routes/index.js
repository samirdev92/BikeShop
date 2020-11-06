var express = require('express');
var router = express.Router();
var dotenv = require('dotenv')
dotenv.config()

const dataBike = [
  {name: 'BIK045', price: 679, urlPicture: '/images/bike-1.jpg'},
  {name: 'ZIK07', price: 799, urlPicture: '/images/bike-2.jpg'},
  {name: 'LIKO89', price: 839, urlPicture: '/images/bike-3.jpg'},
  {name: 'GEW08', price: 1249, urlPicture: '/images/bike-4.jpg'},
  {name: 'KIWIT', price: 899, urlPicture: '/images/bike-5.jpg'},
  {name: 'NASAY', price: 1399, urlPicture: '/images/bike-6.jpg'}
]

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session.dataCardBike)
  if(req.session.dataCardBike === undefined){
    req.session.dataCardBike = []
  }
    console.log(req.session.dataCardBike)
  res.render('index', { dataBike });
});

/* GET shop page. */
router.get('/shop', function(req, res, next) {
  console.log(req.session.dataCardBike)

  function addCart(){
    req.session.dataCardBike.push(
      {
        picture: req.query.picture,
        model: req.query.model,
        price: req.query.price,
        quantity: 1
      })
  }
    
  let doublon = false

  for( let i = 0; i < req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].model === req.query.model){
      req.session.dataCardBike[i].quantity += 1
      doublon = true
    }
  }

  if(doublon === false){
    addCart()
  } 

  res.render('shop', { dataCardBike: req.session.dataCardBike });
}); 
 
/* GET delete page. */
router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query.i, 1)
  res.render('shop', { dataCardBike: req.session.dataCardBike });
});

/* POST update page. */
router.post('/update-shop', function(req, res, next) {
  req.session.dataCardBike[req.body.position].quantity = Number(req.body.quantity)
  res.render('shop', { dataCardBike: req.session.dataCardBike });
});

/* POST checkout stripe page. */
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const stripeItems = []

  for(var i=0;i<req.session.dataCardBike.length;i++){
    stripeItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].model,
        },
        unit_amount: req.session.dataCardBike[i].price * 100,
      },
      quantity: req.session.dataCardBike[i].quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: stripeItems,
    mode: 'payment',
    success_url: 'http://127.0.0.1:3000/success',
    cancel_url: 'http://127.0.0.1:3000/',
  });

  res.json({ id: session.id });
});

router.get('/success', function(req, res, next){
  res.render('success', {})
})
module.exports = router;
