import { Router, urlencoded } from "express";
import { cartModel } from "../models/carts.models.js";
import { productModel} from "../models/products.models.js"
const cartRouter = Router();

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
    const cart = await cartModel.findById(cartId);
    res.render('cart', { cartId });
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
  debugger;
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
      console.log(error)
      res.status(400).send({ response: 'Error adding product to Cart', message: error })
  }
});

//delete product
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
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

//update cart with array
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


//update quantity
cartRouter.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const productIndex = cart.products.findIndex(item => item.id_prod == pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      return res.status(200).json({ message: 'Product quantity updated in cart' });
    } else {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


//delete all products
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