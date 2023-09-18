import { Router, urlencoded } from "express";
import { cartModel } from "../models/carts.models.js";
import { productModel } from "../models/products.models.js"
const cartRouter = Router();

// Add middleware to parse URL-encoded form data
cartRouter.use(urlencoded({ extended: true }));

/**
 * @swagger
 * /carts:
 *   get:
 *     tags: [Carts]
 *     summary: Get all shopping carts.
 *     description: Get a list of all available shopping carts.
 *     responses:
 *       200:
 *         description: List of shopping carts retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: A response message indicating success.
 *                 message:
 *                   type: array
 *                   description: An array of shopping carts.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier of the cart.
 *                       products:
 *                         type: array
 *                         description: An array of products in the cart.
 *                         items:
 *                           type: object
 *                           properties:
 *                             id_prod:
 *                               type: string
 *                               description: The ID of the product in the cart.
 *                             quantity:
 *                               type: number
 *                               description: The quantity of the product in the cart.
 *       404:
 *         description: Shopping carts not found.
 *       500:
 *         description: An error occurred while retrieving shopping carts.
 */


cartRouter.get('/', async (req, res) => {
  try {
    const carts = await cartModel.find();
    return carts ? res.status(200).send({ response: 'OK', message: carts }) : res.status(404).json({ error: 'Shopping carts not found' })
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving shopping carts' });
  }
});


/**
 * @swagger
 * /carts:
 *   post:
 *     tags: [Carts]
 *     summary: Create a new cart
 *     description: Creates a new cart and returns its details.
 *     responses:
 *       201:
 *         description: New cart created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the newly created cart.
 *                 products:
 *                   type: array
 *                   description: The list of products in the cart (initially empty).
 *       500:
 *         description: 'Server Error'
 */

cartRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartModel.create({});
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }

});

/**
 * @swagger
 * /carts/{cid}:
 *   get:
 *     tags: [Carts]
 *     summary: Get cart by ID
 *     description: Retrieve the details of a shopping cart by its unique ID.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: The unique identifier of the shopping cart to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shopping cart details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: A response message indicating success.
 *                 message:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique identifier of the shopping cart.
 *                     products:
 *                       type: array
 *                       description: An array of products in the shopping cart.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_prod:
 *                             type: object
 *                             description: The product associated with the shopping cart.
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: The unique identifier of the product.
 *                               title:
 *                                 type: string
 *                                 description: The title of the product.
 *                               price:
 *                                 type: number
 *                                 description: The price of the product.
 *                           quantity:
 *                             type: number
 *                             description: The quantity of the product in the cart.
 *       404:
 *         description: Shopping cart not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating that the shopping cart was not found.
 */
cartRouter.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findById(cartId);
    res.status(200).send({ response: 'OK', message: cart })
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' })
  }
});

cartRouter.get('/cartView/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findById(cartId);
    res.render('cart', { cartId, products: cart.products });
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' })
  }
});

/**
 * @swagger
 * /carts/{cid}/product/{pid}:
 *   post:
 *     tags: [Carts]
 *     summary: Add product to cart
 *     description: Adds a product to the specified cart and updates the cart's content.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: The ID of the cart to which the product will be added.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: The ID of the product to add to the cart.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: false
 *         description: The quantity of the product to add (default is 1).
 *         schema:
 *           type: object
 *           properties:
 *             quantity:
 *               type: number
 *               description: The quantity of the product to add.
 *     responses:
 *       200:
 *         description: The product was successfully added to the cart.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: A response message indicating success.
 *                 message:
 *                   type: object
 *                   description: The updated cart data.
 *       400:
 *         description: Error adding product to cart. Check request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: A response message indicating an error.
 *                 message:
 *                   type: string
 *                   description: Details of the error.
 *       404:
 *         description: Cart or product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: A response message indicating that the cart or product was not found.
 *                 message:
 *                   type: string
 *                   description: Details of the error.
 */
cartRouter.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params
  const { quantity } = req.body

  try {
    const cart = await cartModel.findById(cid)
    if (cart) {
      const prod = await productModel.findById(pid)

      if (prod) {
        const index = cart.products.findIndex(item => item.id_prod == pid)
        if (index != -1) {
          cart.products[index].quantity = quantity
        } else {
          cart.products.push({ id_prod: pid, quantity: quantity })
        }
        const response = await cartModel.findByIdAndUpdate(cid, cart)
        res.status(200).send({ response: 'OK', message: response })
      } else {
        res.status(404).send({ response: 'Error adding product to Cart', message: 'Product Not Found' })
      }
    } else {
      res.status(404).send({ response: 'Error adding product to Cart', message: 'Cart Not Found' })
    }
  } catch (error) {
    res.status(400).send({ response: 'Error adding product to Cart', message: error })
  }
});

/**
 * @swagger
 * /carts/{cid}/products/{pid}:
 *   delete:
 *     tags: [Carts]
 *     summary: Remove product from cart
 *     description: Removes a product from the specified cart.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: The ID of the cart from which the product will be removed.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: The ID of the product to remove from the cart.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The product was successfully removed from the cart.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the product was removed from the cart.
 *       404:
 *         description: Cart or product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating that the cart or product was not found.
 *
  *       500:
 *         description: Server error
 */
cartRouter.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const index = cart.products.findIndex(item => item.id_prod == pid);
    if (index !== -1) {
      cart.products.splice(index, 1);
      await cart.save();
      return res.status(200).json({ message: 'Product removed from cart' });
    } else {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @swagger
 * /carts/{cid}:
 *   put:
 *     tags: [Carts]
 *     summary: Update cart with products
 *     description: Updates the specified cart with a new list of products.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: The ID of the cart to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 description: An array of products to replace the existing products in the cart.
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_prod:
 *                       type: string
 *                       description: The ID of the product to add to the cart.
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the product in the cart.
 *             example:
 *               products: [{ id_prod: "product_id_1", quantity: 2 }, { id_prod: "product_id_2", quantity: 3 }]
 *     responses:
 *       200:
 *         description: Cart updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the cart was updated successfully.
 *                 cart:
 *                   type: object
 *                   description: The updated cart object.
 *       404:
 *         description: Cart not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating that the cart was not found.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating a server error.
 */

cartRouter.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const cart = await cartModel.findByIdAndUpdate(cid, { products }, { new: true });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


/**
 * @swagger
 * /carts/{cid}/products/{pid}:
 *   put:
 *     tags: [Carts]
 *     summary: Update product quantity in cart
 *     description: Updates the quantity of a specific product in the specified cart.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: The ID of the cart containing the product.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: The ID of the product to update in the cart.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: The new quantity of the product in the cart.
 *             example:
 *               quantity: 5
 *     responses:
 *       200:
 *         description: Product quantity updated in cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the product quantity was updated successfully.
 *       404:
 *         description: Cart or product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating that the cart or product was not found.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating a server error.
 */


/**
 * @swagger
 * /carts/{cid}:
 *   delete:
 *     tags: [Carts]
 *     summary: Delete cart by ID
 *     description: Deletes a cart by its ID, including all products in the cart.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: The ID of the cart to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the cart was deleted successfully.
 *       404:
 *         description: Cart not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating that the cart was not found.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: An error message indicating a server error.
 */

cartRouter.delete('/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await cartModel.findByIdAndDelete(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    return res.status(200).json({ message: 'Cart deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

export default cartRouter;