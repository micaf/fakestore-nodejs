import { Router, urlencoded } from "express";
import multer from 'multer'
import { productModel } from "../models/products.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const productsRouter = Router();

// Add middleware to parse URL-encoded form data
productsRouter.use(urlencoded({ extended: true }));

// Define storage options for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/img')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

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
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort === 'desc' ? -1 : 1; // Ordenamiento ascendente por defecto
        const query = req.query.query || '';
    
        // Condiciones de búsqueda
        const filter = {};
        if (req.query.category) {
          filter.category = req.query.category;
        }
        if (req.query.availability) {
          filter.availability = req.query.availability === 'true';
        }
        if (query) {
          filter.name = { $regex: query, $options: 'i' }; // Búsqueda insensible a mayúsculas y minúsculas
        }
    
        // Consulta a la base de datos utilizando paginate
        const options = {
          page,
          limit,
          sort: { price: sort },
        };
    
        const result = await productModel.paginate(filter, options);
        const response = new ApiResponse(
            'success',
            result.docs.length ? result.docs.map((product) => product.toObject()) : [],
            result.totalPages,
            result.hasPrevPage ? page - 1 : null,
            result.hasNextPage ? page + 1 : null,
            page,
            result.hasPrevPage,
            result.hasNextPage,
            result.hasPrevPage ? `/products?page=${page - 1}` : null,
            result.hasNextPage ? `/products?page=${page + 1}` : null
          );
        res.render('home', {
            css: "style.css",
            data: response,
            title: "Home",
        })

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
        const product = await productModel.findById(productId);
        if (product)
            res.status(200).json(product)
        else
            res.status(404).send({ error: 'Product not found' })
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

 productsRouter.post('/', upload.array('thumbnails', 5), async (req, res) => {
    try {
        const { title, description, stock, code, price, category } = req.body;
        const thumbnails = req.files ? req.files.map(file => file.filename) : []
        const createdProduct = await productModel.create({ title, description, stock, price, category, code, thumbnails });
        res.status(200).json(createdProduct);
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
 productsRouter.put('/:pid', upload.array('thumbnails', 5), async (req, res) => {
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(parseInt(req.params.pid), req.body);
        return updatedProduct ? res.status(200).json(updatedProduct) : res.status(404).send("Product Not Found");
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
        const productDeleted = await productModel.findByIdAndDelete(productId);
        if (productDeleted) {
            res.status(204).send("Product successfully removed");
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default productsRouter