import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import expressSession from 'express-session';
import nodemailer from 'nodemailer';
import {checkCartExists} from './middleware/index';
import {checkShippingDetailsExist} from './middleware/index';
import {checkForToken} from './middleware/index';

dotenv.config();

const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(flash());

app.use(expressSession({
    secret:"tortoise green october",
    resave:false,
    saveUninitialized:false
}));

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/nature", (req, res) => {
    fs.readFile("products.json", (err, data) => {
        if(err){
            console.log(err);
        } else {
            res.render("nature", {
                products:JSON.parse(data)
            });
        }
    });
});

app.get("/abstract", (req, res) => {
    fs.readFile("products.json", (err, data) => {
        if(err){
            console.log(err);
        } else {
            res.render("abstract", {
                products:JSON.parse(data)
            });
        }
    });
});

app.get("/cart", (req, res) => {
    res.render("cart");
});

app.get("/shipping", checkCartExists, (req, res) => {
    res.render("shipping");
});

app.post("/shipping", (req, res) => {
    if(req.body.shippingDetails.email === req.body.shippingDetails.confirmEmail){
        app.locals.shippingDetails = req.body.shippingDetails;
        res.redirect("/confirmation");   
    } else {
        req.flash("error", "Your email addresses didn't match");
        res.redirect("/shipping");
    }   
});

app.get("/confirmation", checkCartExists, checkShippingDetailsExist, (req, res) => {
    res.render("confirmation", {shippingDetails:app.locals.shippingDetails, stripePublicKey:process.env.STRIPE_PUBLIC_KEY});
});

app.post("/create-checkout-session", async (req, res) => {
    app.locals.cartItems = req.body.cartItems;
    app.locals.totalCost = req.body.totalCost;
    let productNames = "";
    Object.values(req.body.cartItems).forEach(item =>{
        productNames += `${item.name} x ${item.inCart}, `;
    });
    app.locals.token = true;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: productNames,
            },
            unit_amount: req.body.totalCost * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.URL}/confirmation-email`,
      cancel_url: `${process.env.URL}/payment-failure`,
    });
  
    res.json({ id: session.id });
  });

app.get("/confirmation-email", checkForToken, (req, res) => {

    app.locals.token = false;
    let productsList = '';
    let products = Object.values(app.locals.cartItems);
    products.forEach(item => {
        productsList += `<div>${item.name} (£${item.price}) X ${item.inCart} - £${item.price * item.inCart}</div>`
    });

    let message = `
    <h2> Booking Confirmation </h2>
    <br>
    <div>Thank you for shopping with Frame & Glory. This email is a confirmation of your purchase. Please find your order details below.</div>
    <br>
    <h3>Items</h3>
    <div>${productsList}</div>
    <div><strong>Total: </strong>£${app.locals.totalCost}</div>
    <br>
    <h3>Shipping Address</h3>
    <div>${app.locals.shippingDetails.name}</div>
    <div>${app.locals.shippingDetails.addressLine1}</div>
    <div>${app.locals.shippingDetails.addressLine2}</div>
    <div>${app.locals.shippingDetails.city}</div>
    <div>${app.locals.shippingDetails.county}</div>
    <div>${app.locals.shippingDetails.postCode}</div>
    <div>${app.locals.shippingDetails.country}</div>
    `

    async function main() {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'outlook',
            auth:{
                user: process.env.USER_EMAIL,
                pass:process.env.USER_PASSWORD
            },
            tls: { rejectUnauthorized: false }
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'Frame & Glory',
            to: app.locals.shippingDetails.email,
            subject: 'Order Confirmation',
            html: message
        });
      
        console.log("Message sent: %s", info.messageId);
      }
      
      main().catch(console.error);

      res.redirect("payment-success");
})  

app.get("/payment-success", (req, res) => {
    app.locals.shippingDetails = {};
    app.locals.cartItems = {};
    app.locals.totalCost = null;
    app.locals.totalProducts = null;
    res.render("paymentSuccess")
});

app.get("/payment-failure", (req, res) => {
    app.locals.token = false;
    res.render("paymentFailure")
});

app.post("/set-locals", (req, res) => {
    app.locals.cartItems = req.body.cartItems;
    app.locals.totalCost = req.body.totalCost;
    app.locals.totalProducts = req.body.totalProducts;
});

app.get("*", (req, res) => {
    res.render("error")
})

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("server is running ...");
})