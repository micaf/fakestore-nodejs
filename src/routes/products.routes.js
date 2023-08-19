import { Router, urlencoded } from "express";
import ProductManager from '../managers/ProductManager.js'

const productsRouter = Router();

// Add middleware to parse URL-encoded form data
productsRouter.use(urlencoded({ extended: true }));

// Create an instance of ProductManager with the path to the products file
const PRODUCTS_FILE = './src/data/products.json';
const productManager = new ProductManager(PRODUCTS_FILE);

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get products
 *     description: Get a list of all available products.
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of products to limit the result to.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products retrieved successfully.
 *       500:
 *         description: An error occurred while retrieving products.
 */
productsRouter.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const products = await productManager.getProducts();
        if (!isNaN(limit)) {
            res.status(200).json(products.slice(0, limit));
        } else {
            res.status(200).json(products); 
        }
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving products' });
    }
});


/**
 * @swagger
 * /products/{pid}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     description: Get a product by its ID.
 *     parameters:
 *       - name: pid
 *         in: path
 *         description: ID of the product to retrieve.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product retrieved successfully.
 *       404:
 *         description: Product not found.
 */

productsRouter.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await productManager.getProductById(productId);
        res.status(200).json(product); // Add res.status(200)
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     description: Create a new product with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: boolean
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               thumbnails:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               title: Sample Product
 *               description: This is a sample product.
 *               code: SP123
 *               price: 49.99
 *               status: true
 *               stock: 100
 *               category: Electronics
 *               thumbnails: ["path/to/image1.jpg", "path/to/image2.jpg"]
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       400:
 *         description: Bad request. Missing or invalid fields.
 */
productsRouter.post('/', async (req, res) => {
    try {
        const newProduct = req.body //
        const createdProduct = await productManager.addProduct(newProduct);
        res.status(201).json(createdProduct); // 201 Created
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /products/{pid}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     description: Update an existing product with the provided information.
 *     parameters:
 *       - name: pid
 *         in: path
 *         description: ID of the product to update.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: boolean
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               thumbnails:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               title: Updated Product
 *               description: This is an updated product.
 *               price: 59.99
 *               stock: 120
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       404:
 *         description: Product not found.
 */
productsRouter.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updatedProduct = await productManager.updateProduct(productId, req.body);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});
/**
 * @swagger
 * /products/{pid}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     description: Delete a product with the specified ID.
 *     parameters:
 *       - name: pid
 *         in: path
 *         description: ID of the product to delete.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted successfully.
 *       400:
 *         description: Bad request. Product not found or other error.
 */
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const productDelected = await productManager.deleteProduct(productId);
        res.status(204).send("Product successfully removed");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default productsRouter