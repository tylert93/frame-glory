document.addEventListener("DOMContentLoaded", () => {

    // UPDATE ITEMS IN CART
    const setCartItems = (e) => {
        let name = e.currentTarget.getAttribute('name');
        let tag = e.currentTarget.getAttribute('tag');
        let price = e.currentTarget.getAttribute('price');
        price = parseInt(price);
        let inCart = e.currentTarget.getAttribute('inCart');
        inCart = parseInt(inCart);
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);

        if(cartItems != null){
            if(cartItems[tag] == undefined){
                cartItems = {
                    ...cartItems,
                    [tag]:{
                        name:name,
                        tag:tag,
                        price:price,
                        inCart:inCart
                    }
                }
            }
            cartItems[tag].inCart += 1;
        } else {
            cartItems = {
                [tag]:{
                    name:name,
                    tag:tag,
                    price:price,
                    inCart:inCart
                }
            }
            cartItems[tag].inCart = 1;
        }

        localStorage.setItem('productsInCart', JSON.stringify(cartItems));
    }

    // UPDATE TOTAL COST WHEN ITEM IS ADDED TO CART
    const totalCost = (e) => {
        let price = e.currentTarget.getAttribute('price');
        price = parseInt(price);
        let totalCost = localStorage.getItem('costOfProducts');
        totalCost = parseInt(totalCost);

        if(totalCost){
            localStorage.setItem('costOfProducts', totalCost + price);
        } else {
            localStorage.setItem('costOfProducts', price);
        }
    }

    // UPDATE CART WHEN ITEM IS ADDED
    const addToCart = (e) => {
        let totalProducts = localStorage.getItem('productNumbers');
        totalProducts = parseInt(totalProducts);

        if(totalProducts){
            localStorage.setItem('productNumbers', totalProducts + 1);
            document.querySelector('.cart-count').textContent = totalProducts + 1;
        } else {
            localStorage.setItem('productNumbers', 1);
            document.querySelector('.cart-count').textContent = 1;
        }
        
        setCartItems(e);
        totalCost(e);
        setLocals();
    }

    // UPDATE CART NUMBERS WHEN PAGE IS LOADED
    const updateCartNumbers = () => {
        let totalProducts = localStorage.getItem('productNumbers');
        
        if(totalProducts){
            if(totalProducts > 0){
                document.querySelector('.cart-count').textContent = totalProducts;
            } else {
                document.querySelector('.cart-count').textContent = '';
            }
        }
    }

    // DECREASE PRODUCT IN CART
    const decreaseProduct = (e) => {
        let tag = e.currentTarget.getAttribute('tag');
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);

        if(cartItems[tag].inCart > 1){
            //UPDATE INCART
            cartItems[tag].inCart -= 1;

            // UPDATE TOTAL COST
            let totalCost = localStorage.getItem('costOfProducts');
            totalCost = parseInt(totalCost);
            totalCost = totalCost - cartItems[tag].price;
            localStorage.setItem('costOfProducts', totalCost);

            // UPDATE CART NUMBER
            let totalProducts = localStorage.getItem('productNumbers');
            totalProducts = parseInt(totalProducts);
            totalProducts -= 1;
            localStorage.setItem('productNumbers', totalProducts);
            updateCartNumbers();        

            localStorage.setItem('productsInCart', JSON.stringify(cartItems));

            displayCart();
        } else {
            removeProduct(e);
        }

        setLocals();
    }

    // INCREASE PRODUCT IN CART
    const increaseProduct = (e) => {
        let tag = e.currentTarget.getAttribute('tag');
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);
        
        //UPDATE INCART
        cartItems[tag].inCart += 1;

        // UPDATE TOTAL COST
        let totalCost = localStorage.getItem('costOfProducts');
        totalCost = parseInt(totalCost);
        totalCost = totalCost + cartItems[tag].price;
        localStorage.setItem('costOfProducts', totalCost);

        // UPDATE CART NUMBER
        let totalProducts = localStorage.getItem('productNumbers');
        totalProducts = parseInt(totalProducts);
        totalProducts += 1;
        localStorage.setItem('productNumbers', totalProducts);
        updateCartNumbers();        

        localStorage.setItem('productsInCart', JSON.stringify(cartItems));

        displayCart();
        setLocals();
    }

    // REMOVE PRODUCT FROM CART
    const removeProduct = (e) => {
        let tag = e.currentTarget.getAttribute('tag');
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);

        // UPDATE TOTAL COST
        let totalCost = localStorage.getItem('costOfProducts');
        totalCost = parseInt(totalCost);
        totalCost = totalCost - (cartItems[tag].inCart * cartItems[tag].price);
        localStorage.setItem('costOfProducts', totalCost);

        // UPDATE CART NUMBER
        let totalProducts = localStorage.getItem('productNumbers');
        totalProducts = totalProducts - cartItems[tag].inCart;
        localStorage.setItem('productNumbers', totalProducts);
        updateCartNumbers();        

        delete cartItems[tag];
        localStorage.setItem('productsInCart', JSON.stringify(cartItems));

        displayCart();
        setLocals();
    }

    // DISPLAY CART
    const displayCart = () => {
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);
        let cartBody = document.querySelector('.cart-body');
        let cartFooter = document.querySelector('.cart-footer');
        let totalCost = localStorage.getItem('costOfProducts');
        totalCost = parseInt(totalCost);

        if(cartItems && cartBody){
            cartBody.innerHTML = '';
            Object.values(cartItems).map(item => {
                cartBody.innerHTML += `
                    <div class="row product-row py-4">
                        <div class="col-2">
                            <img src="/images/${item.tag}.jpg">
                        </div>
                        <div class="col-3 d-flex align-items-center">
                            <div class="word-wrap w-100">${item.name}</div> 
                        </div>
                        <div class="col-2 d-flex align-items-center">
                            <span>£${item.price}</span>
                        </div>
                        <div class="col-3 d-flex align-items-center">
                            <ion-icon class="decreaseButtons btn" name="remove-circle-outline" tag="${item.tag}"></ion-icon>
                            <span class="mx-4">${item.inCart}</span>
                            <ion-icon class="increaseButtons btn" name="add-circle-outline" tag="${item.tag}"></ion-icon>
                        </div>
                        <div class="col-2 d-flex align-items-center">
                            <span>£${item.price * item.inCart}</span>
                        </div>
                    </div>
                `
            })
        }

        if(cartFooter && totalCost){
            cartFooter.innerHTML = `
            <h5 class="text-right mt-4"><strong>Total Cost: £${totalCost}</strong></h5>
            <div class="shipping-button text-center my-5">
                <a class="btn btn-lg btn-success" href="/shipping">Go to shipping</a>
            </div>
            `
        } else if(cartFooter && !totalCost) {
            cartFooter.innerHTML = `
            <h5 class="text-center mt-4"><strong>Your cart is empty</strong></h5>
            `;
        }

        addButtons("decreaseButtons");
        addButtons("increaseButtons");
    }

    const addButtons = (type) => {
        let buttons = document.querySelectorAll(`.${type}`);

        for (let i = 0; i < buttons.length; i++){
            buttons[i].addEventListener('click', (e) => {
                decideAction(e, type);
            });
        }
    }

    const decideAction = (e, type) => {
        if(type == "cartButtons"){
            addToCart(e);
        } else if (type == "increaseButtons"){
            increaseProduct(e);
        } else if (type == "decreaseButtons"){
            decreaseProduct(e);
        }
    }

    const setLocals = () => {
        let totalProducts = localStorage.getItem('productNumbers');
        totalProducts = parseInt(totalProducts);
        let totalCost = localStorage.getItem('costOfProducts');
        totalCost = parseInt(totalCost);
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);

        fetch('/set-locals', {  
            method: 'POST',
            headers: {
                'Content-type': 'application/json' // 
            },
            body: JSON.stringify({
                totalCost:totalCost,
                cartItems:cartItems,
                totalProducts:totalProducts
            })
          })
          .then(function() {
           
          })
          .then(function() {
            
          })
          .then(function(result) {
            if (result.error) {
              alert(result.error.message);
            }
          })
          .catch(function(error) {
            console.error('Error:', error);
          });
    }

    // ENABLE TOOLTIPS
    $('[data-toggle="tooltip"]').tooltip();

    addButtons("cartButtons");
    updateCartNumbers();
    displayCart();
});