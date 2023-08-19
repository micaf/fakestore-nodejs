import fs from 'fs';
import Cart from '../models/Cart.js';

/**
 * Manages carts and their persistence to a file.
 * @class CartManager
 */
class CartManager {
  /**
  * Creates an instance of CartManager.
  * @constructor
  * @param {string} filePath - The path to the file where carts will be stored.
  */
  constructor(filePath) {
    /**
    * The path to the carts file.
    * @type {string}
    * @private
    */
    this.path = filePath;
    /**
 * Next available ID to assign to a cart.
 * @type {number}
 */
    this.nextId = 1;

    /**
* The list of carts.
* @type {Array}
* @private
*/
    this.carts = [];

    // Initialize the class by loading existing carts from the file.
    this.initialize();
  }

  /**
 * Initializes the CartManager instance by loading existing carts from the file.
 * If carts cannot be loaded, initializes an empty list.
 * @private
 */
  async initialize() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
      if (this.carts.length) {
        this.nextId = this.carts[this.carts.length - 1].id + 1;
      }
    } catch (error) {
      this.carts = [];
    }
  }

  /**
 * Saves the list of carts to the file.
 * @private
 */
  async saveCarts() {
    await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');
  }

  /**
   * Creates a new cart and adds it to the list of carts.
   * @returns {Object} - The created cart.
   * @throws {Error} If there's an issue creating the cart.
   */
  async createCart() {
    const cart = new Cart(this.nextId, [])
    this.carts.push(cart);
    this.saveCarts();
    this.nextId++;
    return cart;
  }

  /**
 * Retrieves a cart by its ID.
 * @param {number} cartId - The ID of the cart to retrieve.
 * @returns {Object} - The retrieved cart.
 * @throws {Error} If the cart with the specified ID is not found.
 */
  async getCartById(cartId) {
    return this.carts.find(cart => cart.id === cartId);
  }

  /**
 * Adds a product to a cart.
 * @param {number} cartId - The ID of the cart.
 * @param {number} productId - The ID of the product to add.
 * @param {number} quantity - The quantity of the product to add.
 * @returns {Object} - The updated cart.
 * @throws {Error} If the cart with the specified ID is not found or there's an issue adding the product.
 */
  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    if (cart) {
      const cartUpdated = await this.evaluateProduct(cart, productId, quantity);
      return cartUpdated
    } else {
      throw new Error(`Cart with ID ${id} not found.`);
    }
  }

  /**
  * Evaluates whether a product is already in the cart and updates the cart accordingly.
  * @param {Object} cart - The cart object.
  * @param {number} productId - The ID of the product to evaluate.
  * @param {number} quantity - The quantity of the product to add.
  * @returns {Object} - The updated cart.
  * @private
  */
  async evaluateProduct(cart, productId, quantity) {
    const existingProduct = cart.products.find(product => product.product === parseInt(productId));
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: parseInt(productId), quantity });
    }
    await this.saveCarts();
    return cart
  }
}

export default CartManager;