import express from 'express';
import { config as dotenvConfig } from 'dotenv'; 
import path from 'path';
import { Server } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import productsRouter from './routes/products.routes.js';
import cartRouter from './routes/carts.routes.js';
import swaggerOptions from './swagger-config.js'

import { engine } from 'express-handlebars';
import { __dirname } from './path.js';
import mongoose from 'mongoose'

dotenvConfig();
const app = express();
const PORT = process.env.PORT || 8080;
const swaggerDocs = swaggerJsdoc(swaggerOptions);
mongoose.set("strictQuery", false);

// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));

async function main()  {
    try {
        await mongoose.connect("mongodb+srv://micaelafuentes:p4ssw0rd@ecommerce.fexxjg5.mongodb.net/?retryWrites=true&w=majority", {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          dbName: 'ecommerce'
        });
        console.log('BDD connected');
      } catch (error) {
        console.error('Error in connection to BDD', error);
      }
}



// Middleware to parse incoming JSON data
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Start the Express server and listen on the specified port
const server = app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});


// Configure Handlebars as the template engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));

// Serve static files from the 'public' directory
app.use('/', express.static(path.join(__dirname, '/public/')));


// Mount the routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/products', productsRouter);
//app.use('/api/chat', messagesRouter);
app.use('/api/carts', cartRouter);


