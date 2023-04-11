var STRIPE_KEYS = {
  //'pk_test_*': 'sk_test_*',
  //'pk_live_*': 'sk_live_*'
  // First two are OTR's
  pk_live_omFEyE2DE0tcVCnGOvzp0sAJ00dCLqc2S1:
    'sk_live_iCsrsoPhGJLNKSq8FSkFne0l008z3dcHvN',
  pk_test_IhjSXWyCUV1z477J2hIkSZ3a00agjA0zWQ:
    'sk_test_YkOUfneFFM034yrACr7ELnlg00AlcJyXRR',
  //Last two are Aabe Hayaats
  pk_live_KdrRmdy7ROe9s5mH1NtP29y300sTnjo38i:
    'sk_live_ezOpb03dN8SjEFFJiVEZYtpS00p3rdPbJz',
  pk_test_49KyjiTD5es7O7pvUbDnOSxE00C92Q2WfQ:
    'sk_test_j98Fa7r2H2VrJcQgtKlVhoVY00xa9o3Y1s',
};

var express = require('express');
var app = express();
var cors = require('cors');

var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('port', process.env.PORT || 5001);

app.use(cors());

var corsOptionsDelegate = function (req, callback) {
  callback(null, { origin: true }); // callback expects two parameters: error and options
};
app.options('*', cors(corsOptionsDelegate)); // include before other routes

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/html/code.block2.html');
});

//customer portal endpoint START -- jerry edit 2/22/2021

app.post('/create-customer-portal-session', (request, response) => {
  // // trying to find customer id based on email used
  console.log('This is the request.body  ', request.body);
  var email = request.body.email;
  console.log('this is email,', email);
  var customer_id;
  var output_test_content = 'original'; // used for debugging

  if (email && request.body.key) {
    console.log('looking for customer ' + email);

    // var stripe = require('stripe')('sk_test_YkOUfneFFM034yrACr7ELnlg00AlcJyXRR');
    var stripe = require('stripe')(STRIPE_KEYS[request.body.key]);
    stripe.customers
      .list({
        limit: 100,
      })
      .then(
        async function (customers) {
          try {
            for (var i = 0; i < customers.data.length; i++) {
              console.log('looking at email', customers.data[i].email);

              if (customers.data[i].email === email) {
                customer_id = customers.data[i].id;
                // stripe.customers.del(customers.data[i].id)
                // .then(function(confirm) {
                // 	response.json(confirm);
                // }, function(err) {
                // 	response.status(500).json(err);
                // });
                // output_test_content = confirm;
                break; // break once customer is found is enough
              }
            }
            // output_test_content = customers.data[0];
            if (i == customers.data.length) {
              // couldnt find anything
              response
                .status(500)
                .send('Email: ' + email + ' not found with subscription');
              // response.status(500).json({ message: 'customers.data.length is '+ customers.data.length + 'This is the list of customers' +  output_test_content});
              return response;
            }
          } catch (error) {
            return error;
          }
        },
        function (err) {
          response.status(500).json(err);
        }
      )
      .then(async function () {
        //If customer found create a Customer portal
        if (customer_id === undefined) {
          //   pass;
        } else {
          console.log('It is here ');
          console.log('This is the customer_id ', customer_id);
          console.log('It is here 3');
          console.log('This is output_test_content ', output_test_content);
          // Authenticate your user.
          const session = await stripe.billingPortal.sessions.create({
            customer: customer_id,
            return_url: 'https://www.otrlivingwater.org/giving',
          });

          console.log('This is the session url ' + session.url);
          // response.send(session.url);
          response.send({ status: 200, url: session.url });
          console.log('session.url sent!!!!');
          //   return response.send(session.url);
        }
      });
  } else {
    response.status(500).json({ message: 'send email as param' });
  }

  // // Find customer id END
  // console.log("It is here ");
  // console.log("This is the customer_id ", customer_id);
  // console.log("It is here 2");
  //  // Authenticate your user.
  //  const session = await stripe.billingPortal.sessions.create({
  //    customer: customer_id,
  //    return_url: 'http://www.otrlivingwater.org/giving',
  //  });

  //  console.log("This is the session url" + session.url);
  //  response.redirect(session.url);
});

//customer portal endpoint END

// app.post('/stripe/charge', function (request, response) {
//   if (request.body.token && request.body.key) {
//     console.log('charging ' + request.body.email);

//     var stripe = require('stripe')(STRIPE_KEYS[request.body.key]);
//     stripe.charges
//       .create({
//         amount: request.body.amount,
//         currency: 'usd',
//         source: request.body.token,
//         description: request.body.description,
//         receipt_email: request.body.email,
//       })
//       .then(
//         function (confirm) {
//           response.json(confirm);
//         },
//         function (err) {
//           response.status(500).json(err);
//         }
//       );
//   } else {
//     response.status(400).json({ message: 'send a token' });
//   }
// });

// app.post('/stripe/subscribe', function (request, response) {
//   if (request.body.token && request.body.key) {
//     console.log('subscribing ' + request.body.email);
//     console.log('This is request.body ' + request.body.name); //undefined

//     var stripe = require('stripe')(STRIPE_KEYS[request.body.key]);
//     stripe.customers
//       .create({
//         quantity: parseInt(request.body.amount),
//         plan: 'donation',
//         name: request.body.name, //jerry edit
//         email: request.body.email,
//         source: request.body.token,
//         description: request.body.description,
//         //jerry edit start
//         address: {
//           line1: request.body.addressline1,
//           city: request.body.city,
//           country: request.body.country,
//           postal_code: request.body.zip,
//           state: request.body.state,
//         },
//         //jerry edit end
//       })
//       .then(
//         function (confirm) {
//           response.json(confirm);
//         },
//         function (err) {
//           response.status(500).json(err);
//         }
//       );
//   } else {
//     response.status(400).json({ message: 'send a token' });
//   }
// });

// app.post('/stripe/unsubscribe', function (request, response) {
//   var email = request.body.email;
//   if (email && request.body.key) {
//     console.log('looking for customer ' + email);

//     var stripe = require('stripe')(STRIPE_KEYS[request.body.key]);
//     stripe.customers
//       .list({
//         limit: 100,
//       })
//       .then(
//         function (customers) {
//           for (var i = 0; i < customers.data.length; i++) {
//             console.log('looking at ', customers.data[i].email);

//             if (customers.data[i].email === email) {
//               stripe.customers.del(customers.data[i].id).then(
//                 function (confirm) {
//                   response.json(confirm);
//                 },
//                 function (err) {
//                   response.status(500).json(err);
//                 }
//               );
//               break; // one deletion is enough
//             }
//           }
//           if (i == customers.data.length) {
//             // couldnt find anything
//             response.status(500).json({ message: email + ' not found' });
//           }
//         },
//         function (err) {
//           response.status(500).json(err);
//         }
//       );
//   } else {
//     response.status(500).json({ message: 'send email as param' });
//   }
// });

app.post('/email', function (request, response) {
  console.log('Server side email code begins');
  console.log('This is the request.body ', request.body);
  console.log('This is the request.body.portal_url ', request.body.portal_url);
  console.log('This is the request.body.email ', request.body.email);

  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: 'jerry7285@gmail.com',
      pass: 'wsjfqrtiklucnrwp',
    },
  });

  var mailOptions = {
    from: 'jerry7285@gmail.com',
    to: request.body.email,
    subject: 'Subscription Management Portal Link from OTR Living Water Church',
    text:
      'Thank you for supporting OTR Living Water Church.\n\n 	Please find the link to your Subscription Management Portal here: \n\n' +
      request.body.portal_url +
      '\n\n 	You can use the portal to Update/Cancel your Subscription, Manage Payment, and View Invoices.\n\n Thank you! \n\n Jerry Chang \n OTR Living Water Church Finance Team',
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      response.status(500).json('Error in Sending Portal URL to email');
    } else {
      console.log('Email sent: ' + info.response);
      response.send({ status: 200, email: info.accepted[0] });
    }
  });
});

//creating checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { mode, lineItems, successUrl, cancelUrl, key } = req.body;
    var stripe = require('stripe')(STRIPE_KEYS[key]);

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      custom_text: {
        submit: { message: 'Thank you very much for Supporting our Ministry!' },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/success', async (req, res) => {
  var key = req.query.isOTR
    ? 'sk_live_iCsrsoPhGJLNKSq8FSkFne0l008z3dcHvN'
    : 'sk_live_ezOpb03dN8SjEFFJiVEZYtpS00p3rdPbJz';
  // var key = 'sk_test_YkOUfneFFM034yrACr7ELnlg00AlcJyXRR';
  var stripe = require('stripe')(key); //test mode
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);
  console.log('this is sessions', session);
  console.log('this is customer', customer);
  res.send(session);
});

app.get('/cancel', async (req, res) => {
  res.send('Cancel Endpoint Hit');
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
