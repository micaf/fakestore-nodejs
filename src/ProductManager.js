import fs from 'fs';

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
     * Adds a new product to the list of products and saves it to the file.
     * @param {Object} product - The product object to add.
     * @param {string} product.title - The title of the product.
     * @param {string} product.description - The description of the product.
     * @param {number} product.price - The price of the product.
     * @param {string} product.category - The category of the product.
     * @param {string} product.image - The path to the product image.
     * @param {string} product.code - The unique code identifier of the product.
     * @param {number} product.stock - The quantity of units available in stock.
     * @throws {Error} If any mandatory field is missing or if a product with the same code already exists.
     */
    async addProduct(product) {
        const { title, description, price, category, image, code, stock } = product;

        if (!(title && description && price && category && image && code && stock)) {
            throw new Error("All fields are mandatory.");
        }

        if (this.products.some(existingProduct => existingProduct.code === code)) {
            throw new Error("Product with the same code already exists.");
        }

        const newProduct = {
            id: this.nextId,
            title: title,
            description: description,
            price: price,
            category: category,
            image: image,
            code: code,
            stock: stock
        };

        this.nextId++;
        this.products.push(newProduct);
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
     * @throws {Error} If the product with the specified ID is not found.
     */
    async updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);

        if (productIndex !== -1) {
            this.products[productIndex] = { ...this.products[productIndex], ...updatedFields };
            await this.saveProducts();
        } else {
            throw new Error(`Product with ID ${id} not found.`);
        }
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