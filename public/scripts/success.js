window.addEventListener("DOMContentLoaded", () => {

    localStorage.clear();
    document.querySelector('.cart-count').textContent = "";
    
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

    setLocals();
});