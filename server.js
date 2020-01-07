const express = require('express');
const app = express();
const handlebars = require('express3-handlebars').create({defaultLayout:'main'});
const authModule = require('./lib/auth.js')

let authIps = []


app.engine('handlebars', handlebars.engine);
app.use(express.static(__dirname + '/static'))
app.use(require('body-parser')() )

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT | 3000);

app.get('/', (req, res) => {
	res.render('home', { title:'Homepage', cssPage:'home.css' });
});

app.get('/quiz', (req,res) => {
	let name = req.query.name;
	console.log(name + ' Connected')
	res.render('quiz', { title:name});
})

app.get('/login', (req, res) => {
	res.render('login', { csrf: 'Sample'})
})

app.post('/auth', (req, res) => {
	let authStatus = authModule.authRequest(req.body.name, req.body.pass)

	if(req.body.csrf !== 'Sample') authStatus = false
	if(!authStatus){
		res.redirect('/login')
		console.log(req.ip + ' entered wrong login details')
	}else{

		if(!(req.ip in authIps)) authIps.push(req.ip)
		res.redirect('/control-center')
	}
})

app.get('/control-center', (req, res) => {
	let authenticated = authIps.some( (ip) => {
		if(ip == req.ip) return true
		else false
	})

	if(authenticated){
		console.log('Successful login by ' + req.ip)
		res.render('control-center')
	}else{
		console.log(req.ip + ' tried to access ' + req.path + '\n \t Redirected to Login Page')
		res.redirect('/login')
	}

})

app.get('/showAuthIps', (req, res) => {
	res.status(404)
	console.log(authIps)
})

app.listen(app.get('port'), () => {
	console.log('Server ready at http://localhost:3000/');
});
