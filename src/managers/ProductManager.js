import fs from 'fs';
import Product from '../models/Product.js';

/**
 * Class for managing products and their persistence to a file.
 */
class ProductManager {
    /**
     * Creates an instance of ProductManager.
     * @param {string} filePath - The path to the file where products will be stored.
     */
    constructor(filePath) {
        /**
         * Path to the products file.
         * @type {string}
         */
        this.path = filePath;

        /**
     * Next available ID to assign to a product.
     * @type {number}
     */
        this.nextId = 1;

        /**
         * List of products.
         * @type {Array}
         */
        this.products = [];

        // Initialize the class by loading existing products from the file.
        this.initialize();
    }

    /**
     * Initializes the ProductManager instance by loading existing products from the file.
     * If products cannot be loaded, initializes an empty list.
     * @private
     */
    async initialize() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
            if (this.products.length) {
                this.nextId = this.products[this.products.length - 1].id + 1;
            }
        } catch (error) {
            this.products = [];
        }
    }

    /**
     * Saves the list of products to the file.
     * @private
     */
    async saveProducts() {
        await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
    }

    /**
     * Validates the fields of a product.
     * @param {Object} product - The product object to validate.
     * @throws {Error} If any mandatory field is missing.
     */
    validateProductFields(product) {
        const requiredFields = ["title", "description", "price", "category", "code", "stock"];
        const missingFields = requiredFields.filter(field => !product[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing fields: ${missingFields.join(", ")}`);
        }
    }

    /**
     * Validates whether a product with the same code already exists.
     * @param {string} code - The code of the product to validate.
     * @throws {Error} If a product with the same code already exists.
     */
    validateDuplicateCode(code) {
        if (this.products.some(existingProduct => existingProduct.code === code)) {
            throw new Error("Product with the same code already exists.");
        }
    }

    /**
     * Adds a new product to the list of products and saves it to the file.
     * @param {Object} product - The product object to add.
     */
    async addProduct(product) {
        const { title, description, code, price, status, stock, category, thumbnails } = product
        this.validateProductFields(product);
        this.validateDuplicateCode(product.code);

        const newProduct = new Product(
            this.nextId, // Generate a unique ID
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        );

        this.products.push(newProduct);
        this.nextId++;
        await this.saveProducts();
    }

    /**
     * Retrieves the complete list of products.
     * @returns {Promise<Array>} - The list of products.
     */
    async getProducts() {
        return this.products;
    }

    /**
     * Searches for and returns a product by its ID.
     * @param {number} id - The ID of the product to find.
     * @returns {Promise<Object>} - The found product object.
     * @throws {Error} If the product with the specified ID is not found.
     */
    async getProductById(id) {
        const product = this.products.find(product => product.id === id);

        if (!product) {
            throw new Error(`Product with ID ${id} not found.`);
        }

        return product;
    }

    /**
     * Updates an existing product in the list and saves it to the file.
     * @param {number} id - The ID of the product to update.
     * @param {Object} updatedFields - The updated fields of the product.
     * @returns {Promise<Object>} - The updated product object.
     * @throws {Error} If the product with the specified ID is not found.
     */
    async updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);

        if (productIndex === -1) {
            throw new Error(`Product with ID ${id} not found.`);
        }

        const updatedProduct = {
            ...this.products[productIndex],
            ...updatedFields
        };

        this.products[productIndex] = updatedProduct;
        await this.saveProducts();

        return updatedProduct;
    }

    /**
     * Deletes a product by its ID.
     * @param {number} id - The ID of the product to delete.
     * @throws {Error} If the product with the specified ID is not found.
     */
    async deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);

        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            await this.saveProducts();
        } else {
            throw new Error(`Product with ID ${id} not found.`);
        }
    }
}

export default ProductManager;
