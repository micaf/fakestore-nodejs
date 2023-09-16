// Función para obtener el cart_id del localStorage
function getCartId() {
    return localStorage.getItem('cart_id');
}

// Función para crear un nuevo carrito y almacenar su ID en el localStorage
async function createCartAndStoreId() {
    try {
        const response = await fetch('/carts', {
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



document.addEventListener('DOMContentLoaded', async() => {
    // Verificar si ya existe un cart_id en el localStorage
    let cartId = getCartId();

    if (!cartId) {
        await createCartAndStoreId();
    }

    const cartButton = document.querySelector('.cart-button');

    cartButton.addEventListener('click', () => {
        window.location.href = `api/carts/${cartId}`;
    })



    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.getAttribute('name'); // Obtener el ID del producto desde el atributo "data-product-id"

            // Cantidad predeterminada (puedes personalizar esto)
            const quantity = 1;

            try {
                // Realizar la solicitud POST al servidor utilizando fetch
                const response = await fetch(`api/carts/${cartId}/product/${productId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quantity }),
                });
                if (response.ok) {
                    // La solicitud fue exitosa, puedes manejar la respuesta aquí (por ejemplo, mostrar un mensaje de éxito).
                    alert('Product added to cart successfully');
                } else {
                    // La solicitud falló, maneja el error aquí (por ejemplo, muestra un mensaje de error).
                    alert('Error adding product to cart');
                }
            } catch (error) {
                // Manejar errores de red u otros errores aquí.
                console.error(error);
                alert('An error occurred');
            }
        });
    });
});