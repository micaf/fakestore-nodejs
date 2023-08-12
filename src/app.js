import express from 'express';
import { config as dotenvConfig } from 'dotenv'; 
import ProductManager from './ProductManager.js';

dotenvConfig();

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = './src/products.json'

// Create an instance of ProductManager with the path to the products file
const productManager = new ProductManager(PRODUCTS_FILE); 

app.use(express.json());

// Route to fetch all products with an option to limit results
app.get('/products', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // Read the 'limit' query parameter
        const products = await productManager.getProducts();
        if (!isNaN(limit)) {
            res.status(200).json(products.slice(0, limit)); // Add res.status(200)
        } else {
            res.status(200).json(products); // Add res.status(200)
        }
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving products' });
    }
});

// Route to fetch a product by its ID
app.get('/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await productManager.getProductById(productId);
        res.status(200).json(product); // Add res.status(200)
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});