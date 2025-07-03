const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51Rc0fwC89rIJCFHUuM7DTtciiDt1xYV5QFgjhdLxOoiYshyzEQYIUxpoghYwraJayrbqYHiKMSXx5XhN060XZIHG00IkH6qcyV'); // Mets ta clé secrète ici

module.exports = { stripe };
