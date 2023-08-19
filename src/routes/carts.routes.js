import { Router, urlencoded } from "express";
import CartManager from "../managers/CartManager.js";


const cartRouter = Router();
// Create an instance of CartManager with the path to the carts file
const CART_FILE = './src/data/cart.json';
const cartManager = new CartManager(CART_FILE); 

// Add middleware to parse URL-encoded form data
cartRouter.use(urlencoded({ extended: true }));

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
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created cart.
 *                 products:
 *                   type: array
 *                   description: The list of products in the cart (initially empty).
 */
cartRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
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
 *     description: Retrieves the details of a cart by its ID.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID of the cart to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the cart.
 *                 products:
 *                   type: array
 *                   description: The list of products in the cart.
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         description: The ID of the product in the cart.
 *                       quantity:
 *                         type: number
 *                         description: The quantity of the product in the cart.
 *       404:
 *         description: Cart not found.
 */
cartRouter.get('/:cid', async(req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cartId);
    res.status(200).json(cart);
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
 *     description: Adds a product to the specified cart.
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         description: ID of the cart to add the product to.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         required: true
 *         description: ID of the product to add.
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: false
 *         description: Quantity of the product to add (default is 1).
 *         schema:
 *           type: object
 *           properties:
 *             quantity:
 *               type: number
 *               description: Quantity of the product to add.
 *     responses:
 *       200:
 *         description: Product added to cart successfully.
 *       404:
 *         description: Cart not found.
 */
cartRouter.post('/:cid/product/:pid', async(req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const quantity = parseInt(req.body.quantity) || 1;
    const productAdded = await cartManager.addProductToCart(cartId, productId, quantity);
    res.status(200).send(productAdded);
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' })
  }
});

export default cartRouter;