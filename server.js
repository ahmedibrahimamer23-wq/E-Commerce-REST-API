const app = require('./app');
const mongoose = require('mongoose');

mongoose.connect(process.env.CONN_LINK)
.then(() => {
    console.log('DB Connected');
})
.catch(err => console.log(err));
app.get('/', (req,res)=>{
    res.send('hi')
})
app.listen(3000, () => {
    console.log('server running on `http://localhost:3000`');
});