import express from 'express';

const app = express();

export const checkCartExists = (req, res, next) => {
    if(req.app.locals.totalProducts && req.app.locals.totalCost && req.app.locals.cartItems){
        return next()
    }
    req.flash("error", "Your cart is empty")
    res.redirect("/cart");
}

export const checkShippingDetailsExist = (req, res, next) => {
    if(req.app.locals.shippingDetails){
        return next()
    }
    req.flash("error", "You haven't entered any shipping details")
    res.redirect("/shipping");
}