const express = require('express');
const app = express();
const handlebars = require('express3-handlebars').create({defaultLayout:'main'});
const authModule = require('./lib/auth.js')
const cookieParser = require('cookie-parser')
const cookieKey = require('./creditails.js').cookieKey
const chalk = require('chalk')
//const questionManager = require('./lib/questionManager.js')
const mongoClient = require('mongodb').MongoClient
const mongoUri = require('./creditails.js').mongoUri
const client = 

mongoClient.connect(mongoUri, (err, client) => {
	if(err){
		console.log('Error ' + err)
	}
	console.log('Database Connected')
	let dbs = client.db().admin().listDatabases()
	console.log(dbs)
})


let authIps = []

app.engine('handlebars', handlebars.engine);

app.use(express.static(__dirname + '/static'))
app.use(require('body-parser')() )
app.use(cookieParser(cookieKey))

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT | 3000);

app.get('/', (req, res) => {
	if(req.signedCookies.name){
		res.redirect('/quiz') 	
	}else res.render('home', { title:'Homepage', cssPage:'home.css' });
});

app.get('/quiz', (req,res) => {
	let name
	
	if(req.signedCookies.name && req.signedCookies.name != req.query.name){
		name = req.signedCookies.name 
		console.log(chalk.red('\nALERT! \n\t>>Name Overwritting At ') + chalk.magenta(req.ip) + chalk.red(' with "')+ chalk.bold(req.query.name) +chalk.red('", Old value reassigned ') + chalk.bold(name))
		console.log(chalk.red('\t' + name + ' REconnected'))
		console.log(chalk.red('\tTo Overwrite Goto http://' + req.hostname + ':3000/remove-cookies\n'))
		res.render('quiz', { title:name });
	}else{
		if(req.query.name){
			name = req.query.name;
			res.cookie('name',name,{signed: true})
			if(req.signedCookies.name != req.query.name) console.log(name + chalk.green(' Connected'))
			res.render('quiz', { title:name });
		}else{
			console.log(req.ip + chalk.cyan(' Direct Access To Quiz Page, Redirected'))
			res.redirect('/')
		}
	}
	
	

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
		console.log(chalk.greenBright('Successful login by ' + req.ip))
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
		
		res.render('control-center')
	}else{
		console.log(req.ip + ' tried to access ' + req.path + '\n \t Redirected to Login Page')
		res.redirect('/login')
	}

})

app.get('/showAuthIps', (req, res) => {
	res.status(404)
	console.log('Authenticated Ips->  ' + authIps + '\t Request by ' + req.ip)
})

app.get('/remove-cookies', (req, res) => {
	if(req.signedCookies.name){
		res.clearCookie('name')
		res.send('Cookies Erased')
		console.log(chalk.yellowBright(req.ip + "'s Cookies Erased"))
	}else{
		res.send('No Cookies Found')
	}
})


const startServer = () => {
	const server = app.listen(app.get('port'), () => {
		console.log(chalk.italic(chalk.bgGray('Server ready at http://localhost:3000/')));
	});
}

if(require.main == module){
	//If run directly
	startServer()
}else{
	module.exports = startServer
}