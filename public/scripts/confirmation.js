document.addEventListener("DOMContentLoaded", () => {

    // DISPLAY CART
    const displayConfirmationCart = () => {
        let cartItems = localStorage.getItem('productsInCart');
        cartItems = JSON.parse(cartItems);
        let confirmCartBody = document.querySelector('.confirm-cart-body');
        let confirmCartFooter = document.querySelector('.confirm-cart-footer');
        let totalCost = localStorage.getItem('costOfProducts');
        totalCost = parseInt(totalCost);
       
        confirmCartBody.innerHTML = '';
        Object.values(cartItems).map(item => {
            confirmCartBody.innerHTML += `
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
                        <span class="mx-4">${item.inCart}</span>
                    </div>
                    <div class="col-2 d-flex align-items-center">
                        <span>£${item.price * item.inCart}</span>
                    </div>
                </div>
            `    
        })

        confirmCartFooter.innerHTML = `
            <h5 class="text-right mt-4"><strong>Total Cost: £${totalCost}</strong></h5>
        `
    }
    
    displayConfirmationCart();

})