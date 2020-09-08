import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import expressSession from 'express-session';
import {checkCartExists} from './middleware/index';
import {checkShippingDetailsExist} from './middleware/index';

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
    res.render("index", {test:req.app.locals.totalProducts});
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
      success_url: `${process.env.URL}/payment-success`,
      cancel_url: `${process.env.URL}/payment-failure`,
    });
  
    res.json({ id: session.id });
  });

app.get("/payment-success", (req, res) => {
    app.locals.shippingDetails = {};
    app.locals.cartItems = {};
    app.locals.totalCost = null;
    app.locals.totalProducts = null;
    res.render("paymentSuccess")
});

app.get("/payment-failure", (req, res) => {
    res.render("paymentFailure")
});

app.post("/set-locals", (req, res) => {
    app.locals.cartItems = req.body.cartItems;
    app.locals.totalCost = req.body.totalCost;
    app.locals.totalProducts = req.body.totalProducts;
    console.log(app.locals.cartItems, app.locals.totalCost, app.locals.totalProducts);
});

app.get("*", (req, res) => {
    res.render("error")
})

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("server is running ...");
})