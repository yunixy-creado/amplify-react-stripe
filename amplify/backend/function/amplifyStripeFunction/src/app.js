/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["STRIPE_LIMITED_API_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const aws = require('aws-sdk')
async function loadStripeAPIKey() {
  const { Parameter } = await (new aws.SSM())
    .getParameter({
      Name: process.env["STRIPE_LIMITED_API_KEY"],
      WithDecryption: true,
    })
    .promise()

    const stripeApiKey = Parameter.Value
    if (!stripeApiKey) {
      throw new Error('STRIPE_LIMITED_API_KEYがSecret valuesに設定されていません。')
    }

    return stripeApiKey
}

async function loadStripe() {
  const apiKey = await loadStripeAPIKey()
  return require('stripe')(apiKey)
}

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


/**********************
 * 商品一覧を取得するAPI *
 **********************/
app.get('/shop/products', async function(req, res) {
  // Add your code here
  const stripe = await loadStripe()
  const items = await stripe.products.list()
  const response = await Promise.all(items.data.map(async product => {
    const priceResponse = await stripe.prices.list({
      product: product.id
    })
    product.prices = priceResponse.data
    return product
  }))
  res.json(response);
});

/****************************
* Stripe Checkout           *
* 決済ページURLを作成するAPI    *
****************************/
app.post('/shop/products/:price_id/checkout', async function(req, res) {
  const stripe = await loadStripe()
  const priceId = req.params.price_id;
  const appUrl = req.headers.origin || 'http://localhost:3000';

  const price = await stripe.prices.retrieve(priceId)
  if (!price) {
    return res.status(404).json({
      message: '存在しない料金IDです。'
    })
  }

  const mode = price.type === 'recurring' ? 'subscription': 'payment'
  const param = {
    mode,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    cancel_url: `${appUrl}/cancel`,
    success_url: `${appUrl}/success`,
    billing_address_collection: 'required',
    shipping_address_collection: {
        allowed_countries: ['JP']
    },
    allow_promotion_codes: true,
  }
  if (mode === 'subscription') {
    param.subscription_data = {
      trial_period_days: 14
    }
  } else {
    param.submit_type = 'donate'
  }

  const session = await stripe.checkout.sessions.create(param)
  res.json(session)

});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
