// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const UserRoutes = require('../routes/user');

// const app = express();

// mongoose.connect('mongoose://127.0.0.1:27017/blogplatform',{
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }).
//     then(() => console.log('Connected to MongoDB')).
//     catch(err => console.error('Could not connect to MongoDB'));

// app.use(express.json());
// app.use(cors());

// //app.use('/user', require('./routes/user'));
// app.use('/user', UserRoutes);


// const port = process.env.PORT || 3000;

// app.listen(post, () => console.log(`Server started on port ${post}`));


const express = require('express');
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

app.use(express.json());
app.use(cors());


app.use('/user', UserRoutes);
app.use('/post', PostRoutes);
app.use('/interaction', InteractionRoutes);
app.use('/search', searchRoutes);
app.use('/admin', adminRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));
