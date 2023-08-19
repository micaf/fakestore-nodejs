import express from 'express';
import { config as dotenvConfig } from 'dotenv'; 
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import productsRouter from './routes/products.routes.js';
import cartRouter from './routes/carts.routes.js';
import swaggerOptions from './swagger-config.js'

dotenvConfig();
const app = express();
const PORT = process.env.PORT || 8080;
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);


app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});