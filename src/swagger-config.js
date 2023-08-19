const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Eccomerce API',
        version: '1.0.0',
        description: 'Eccommerce API Documentation',
      },
      servers: [{ url: '/api' }],
    tags: [
      {
        name: 'Products',
        description: 'Endpoints related to products', 
      },
      {
        name: 'Carts',
        description: 'Endpoints related to carts',
      },
    ]
    },
    apis: ['./src/routes/*.js'],
    
  };
  
  export default swaggerOptions;