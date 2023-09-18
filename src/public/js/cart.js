// Function to obtain the cart_id of the localStorage
function getCartId() {
    return localStorage.getItem('cart_id');
}

// Function to create a new cart and store its ID in localStorage
async function createCartAndStoreId() {

    try {
        const response = await fetch('api/carts', {
            method: 'POST',
        });

        if (response.ok) {
            const data = await response.json();
            if (data._id) {
                const cartId = data._id; // Suponiendo que el servidor devuelve el ID del nuevo carrito
                localStorage.setItem('cart_id', cartId);
                return cartId;
            }
        } else {
            throw new Error('Failed to create cart');
        }
    } catch (error) {
        console.error('Error creating cart:', error);
        throw error;
    }
}

async function getCart(cartId) {

    // Make a request to the server to get the cart data
    fetch('api/carts/' + cartId)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching cart data:', error);
        });
}

// Function to add a product to the cart
async function addProductToCart(cartId, productId, quantity) {
    try {
        const response = await fetch(`api/carts/${cartId}/product/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) {
            throw new Error('Error adding product to cart');
        }
    } catch (error) {
        throw error;
    }
}

// Function for updating the quantity of a product in the cart
async function updateProductInCart(cartId, productId, quantity) {
    try {
        const response = await fetch(`api/carts/${cartId}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) {
            throw new Error('Error updating product quantity in cart');
        }
    } catch (error) {
        throw error;
    }
}


async function getCartProducts(cartId) {
    try {
        const response = await fetch('api/carts/' + cartId);
        if (!response.ok) {
            throw new Error('Error fetching cart data');
        }
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error fetching cart data:', error);
        return null;
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // Check if a cart_id already exists in the localStorage
    let cartId = getCartId();

    if (!cartId) {
        cartId = await createCartAndStoreId();
    }

    const cartButton = document.querySelector('.cart-button');

    cartButton.addEventListener('click', () => {
        window.location.href = `api/carts/cartView/${cartId}`;
    })



    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.getAttribute('name');
            const quantity = 1;
            const cart = await getCartProducts(cartId);

            try {
                // Check if the product already exists in the cart
                const existingProduct = cart.products.find(item => item.id_prod._id === productId);
                if (existingProduct) {
                    const newQuantity = existingProduct.quantity + quantity;
                    await updateProductInCart(cartId, productId, newQuantity);
                } else {
                    // If the product does not exist in the cart, add it to the cart
                    await addProductToCart(cartId, productId, quantity);
                }
                alert('Product added to cart successfully');
            } catch (error) {
                alert('An error occurred');
            }
        });
    });
});