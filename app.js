const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const mongoose = require('mongoose');
const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const InteractionRoutes = require('./routes/interaction');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');

const cors = require('cors');

const app = express();


mongoose.connect('mongodb://127.0.0.1:27017/blogplatform').
    then(() => console.log('Connected to MongoDB')).
    catch(err => console.error(err));

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Blog Platform By Mahad",
      version: "0.1.0",
      description:
        "This is a blog posting platform where users can enjoy public blogs and share there blogs.",
    //   license: {
    //     name: "MIT",
    //     url: "https://spdx.org/licenses/MIT.html",
    //   },
    //   contact: {
    //     name: "LogRocket",
    //     url: "https://logrocket.com",
    //     email: "info@email.com",
    //   },
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {explorer: true})
);
app.use(cors());
app.use(express.json());


app.use('/user', UserRoutes);
app.use('/post', PostRoutes);
app.use('/interaction', InteractionRoutes);
app.use('/search', searchRoutes);
app.use('/admin', adminRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));
