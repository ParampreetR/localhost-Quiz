const express = require('express');
const app = express();
const handlebars = require('express3-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(express.static(__dirname + '/static'))

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT | 3000);

app.get('/', (req, res) => {
	res.render('home', { title:'Homepage', cssPage:'home.css' });
});

app.get('/quiz', (req,res) => {
	let name = req.query.name;
	res.render('quiz', { title:name});

})

app.listen(app.get('port'), () => {
	console.log('Server ready at http://localhost:3000/');
});
