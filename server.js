const express = require('express');
const app = express();
const handlebars = require('express-handlebars').create({defaultLayout:'main'});
const authModule = require('./lib/auth.js')
const cookieParser = require('cookie-parser')
const cookieKey = require('./creditails.js').cookieKey
const chalk = require('chalk')
const questionSch = require('./lib/mongo.js')[0]
const authIpsDb = require('./lib/mongo.js')[1]
const mongoUri = require('./creditails.js').mongoUri
const mongoClient = require('mongodb').MongoClient
const mongo = require('mongodb')
const mongoose = require('mongoose')
const mongooseOptions = {
	useNewUrlParser: true,
	useUnifiedTopology: true
}
// Global Variables 
let operationSuccessful = false
let results = []





mongoose.connect(mongoUri, mongooseOptions).then(
	() => {
		console.log(chalk.greenBright('Database Connected'))
	},
	err => {
		console.log(err)
	}
)



/*
mongoClient.connect(mongoUri, mongooseOptions, (err, db) => {
	if(err) console.log(err)
	let authipsCon =  db.db('test').collection('questions')
	console.log(authipsCon.findOne({}))
})

*/

const ajaxAlert = (myAlert) => {


}


// Control Center --- javaScript  ---- res  ---- server.js ---- req ---- javaScript ---- Other Pages



// Authenticated Ip List's Database Functions
const addIpToAuthIps = (ipToAdd) => {
	let ipAddToDb = new authIpsDb({ip: ipToAdd})
	ipAddToDb.save((err, data) => {
		if (err) {
			console.log(err)
			return false
		}else{
			console.log(ipToAdd + ' Successfully Added To Database')
			console.log(data)
			return true
		}
	})
}

const findIpInAuthIps = (ipToFind) => {
	authIpsDb.find({ip: ipToFind}, (err, data) => {
		if(err) console.log(err)
		if(data[0]){
			console.log('true')
			operationSuccessful = true
		}else{
			console.log(data)
			return false
		}
	})
	if(operationSuccessful){
		return true
	}
}

const delIpInAuthIps = (ipToDelete) => {
	authIpsDb.deleteOne({ip: ipToDelete}, (err, data) => {
		if(err) console.error(err)
		if(data.ok == 1) return true
		else{
			console.log(data)
			return false
		}
	})
}


const getQuestionsFromDb = () => {
	questionSch.find({}, (err, data) => {
		if(err){
			console.log(err)
			operationSuccessful = false
			return false
		}
		console.log('Question Data')
		console.log(data)
		console.log('Question data ended')
		return [data.question, data.option1]
	})
	if(operationSuccessful){
		console.log('Returned True')
		return operationSuccessful
	}
}


const addQuestionToDb = (quesToAddDb) => {
	quesToAddDb = new questionSch(quesToAddDb)
	quesToAddDb.save( (err, data) => {
		if(err){
			console.error(err)
		}else{
			return data
		}
	})
}




let authIps = []

app.engine('handlebars', handlebars.engine);

app.use(express.static(__dirname + '/static'))
app.use(require('body-parser')() )
app.use(cookieParser(cookieKey))

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT | 8080);

// 500 Handler
app.use( (err, req, res, next) => {
	console.log(err)
	console.log('ERROR')
	next();
})

app.get('/', (req, res) => {
	if(req.signedCookies.name){
		res.redirect('/quiz') 	
	}else res.render('home', { title:'Homepage', cssPage:'home.css' });
});

app.get('/quiz', (req,res) => {
	let name
	
	if(req.signedCookies.name && req.signedCookies.name != req.query.name && req.query.o != 'ignore'){
		name = req.signedCookies.name 
		console.log(chalk.red('\nALERT! \n\t>>Name Overwritting At ') + chalk.magenta(req.ip) + chalk.red(' with "')+ chalk.bold(req.query.name) +chalk.red('", Old value reassigned ') + chalk.bold(name))
		console.log(chalk.red('\t' + name + ' REconnected'))
		console.log(chalk.red('\tTo Overwrite Goto http://' + req.hostname + ':3000/remove-cookies\n'))
		console.log(req.query.o)
		res.redirect('/quiz/?o=ignore&name=' + req.signedCookies.name)
	}else{
		if(req.query.name && req.query.name != 'undefined'){
			name = req.query.name;
			res.cookie('name',name,{signed: true})
			if(req.signedCookies.name != req.query.name) console.log(name + chalk.green(' Connected'))
			
			questionSch.find({}, (err, data) => {
				if(err){
					console.log(err)
				}
				console.log(data)
				res.render('quiz', { title: name, cssPage: 'quiz.css', quizData: data});
			})


			
		}else{
			if(req.signedCookies.name){
				res.clearCookie('name')
			}
			console.log(req.ip + chalk.cyan(' Direct Access To Quiz Page, Redirected'))
			res.redirect('/')
		}
	}
})

app.post('/quiz', (req, res) => {
	let resToSend = 'add'
	let founded = false
	console.log(req.body)
	questionSch.find({_id: req.body.id}, (err, data) => {
		if(err){
			console.log(err)
		}
		if(data[0].correct == req.body.option){
			
			results.forEach( (val, pos) => {
				if(val == req.ip){
					if(results[pos + 1] >= 0 && results[pos + 1] <= 100){
						founded = true
						results[pos + 1] = results[pos + 1] + 1
						results[pos + 2] = results[pos + 2] + 1

						questionSch.find({}, (err, data) => {
							if(err){
								console.log(err)
							}
							if(data.length == results[pos + 2]){
								console.log('condition True')
								resToSend = 'result'
								res.send('Results')
							}

						})

						console.log(results)
					}
				}
				if(founded == false)
					if(pos >= (results.length - 1)){
						results.push(req.ip)
						results.push(1)
						results.push(1)
					}
				console.log(results)
			})
			
			
			console.log('Correct')
		}else{
			results.forEach( (val, pos) => {
				if(val == req.ip){
					if(results[pos + 2] >= 0 && results[pos + 2] <= 100){
						results[pos + 2] = results[pos + 2] + 1
						console.log(results)
						founded = true

						questionSch.find({}, (err, data) => {
							if(err){
								console.log(err)
							}
							console.log(data)
							if(data.length == results[pos + 2]){
								console.log('condition True')
								resToSend = 'result'
								
							}
						})
					}
				}
				if(founded == false)
					if(pos >= (results.length - 1)){
						results.push(req.ip)
						results.push(0)
						results.push(1)
					}
			})
			

			console.log('Wrong')
			
		}
		//console.log(data)
		//res.render('quiz', { title: name, cssPage: 'quiz.css', quizData: data});
		
	})
	res.send('OK')
	
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
		if(!(findIpInAuthIps(req.ip))) addIpToAuthIps(req.ip)
		res.redirect('/check-dest')
	}
})

app.get('/check-dest', (req, res) => {
	if(req.signedCookies.loginDest){
		res.redirect(302, req.signedCookies.loginDest)
		console.log(req.signedCookies.loginDest)
	}else{
		res.redirect('/control-center')
	}
})




app.get('/control-center', (req, res) => {
	let authenticated = findIpInAuthIps(req.ip)

	if(authenticated){
		res.render('control-center')
	}else{
		console.log(req.ip + ' tried to access ' + req.path + '\n \t Redirected to Login Page')
		res.redirect('/login')
	}

})

app.get('/edit-dbquestions', (req, res) => {
	if(req.signedCookies.loginDest){
		res.clearCookie('loginDest')
	}
	console.log(req.ip)
	let authDbBoolean = findIpInAuthIps(req.ip);
	if(authDbBoolean){
		
		questionSch.find({}, (err, data) => {
			if(err){
				console.log(err)
				operationSuccessful = false
				return false
			}
			console.log('Question Data')
			console.log(data)
			console.log('Question data ended')
			res.render('edit-dbquestions', { questionList: data })
		})
		if(operationSuccessful){
			console.log('Returned True')
			return operationSuccessful
		}
		
		
		console.log(getQuestionsFromDb())
		res.render('edit-dbquestions', { questionList: getQuestionsFromDb() })
		console.log('Rendered')
	}else{
		res.cookie('loginDest', req.path, {signed: true})
		res.redirect('/login')
		console.log('redirected')
	}
})

app.get('/add-questions', (req, res) => {
	let authDbBoolean = findIpInAuthIps(req.ip);
	if(authDbBoolean)
		res.render('addquestion', { cssPage: 'addques.css'})
	/*
	authIpsDb.find({ip: req.ip}, (err, data) => {
		if(err) console.log(err)
		if(data[0]){
			console.log('true')
			res.render('addquestion', { cssPage: 'addques.css'})
		}else{
			console.log(data)
			return false
		}
	})
	*/
	
	
})

app.post('/add-questions', (req, res) => {
	//console.log(req.headers)
	//console.log(req.body)
	//console.log(req.xhr)
	let authDbBoolean = findIpInAuthIps(req.ip);
	if(req.xhr & authDbBoolean){
		quesToAddMod = req.body
		switch(quesToAddMod.correct){
			case "1":
				quesToAddMod.correct = req.body.option1
				break
				
			case "2":
				quesToAddMod.correct = req.body.option2
				break
		
			case "3":
				quesToAddMod.correct = req.body.option3
				break
				
			case "4":
				quesToAddMod.correct = req.body.option4
				break
			
			default:
				console.log('Error While Processing Adding Question')
				console.log('Exceptional Case in Correct Option Range(1,2,3,4)')
		}
		console.log(quesToAddMod)
		
		quesToAddDb = new questionSch(req.body)
		quesToAddDb.save( (err, data) => {
			if(err){
				console.error(err)
			}else{
				console.log(data)
			}
			
			questionSch.find({}, (err, data) => {
				if(err){
					console.log(err)
				}
				res.send(data.length + ' Questions Added')
				
			})
					
		})
		//res.send()
	}
})


app.get('/list-questions', (req, res) => {
	let authDbBoolean = findIpInAuthIps(req.ip);
	if(authDbBoolean)
		questionSch.find({}, (err, data) => {
			if(err){
				console.log(err)
			}
			console.log(data)
			res.render('listques', {questions: data, cssPage: 'listques.css'})
		})
})

app.post('/list-questions', (req, res) => {
	let authDbBoolean = findIpInAuthIps(req.ip);
	if(authDbBoolean){
		console.log(req.body)
		questionSch.deleteOne({ _id: req.body.id }, function(err) {
			if (!err) {
				console.log('notification!')
			}else{
				
				console.log('error')
			}
		});
		res.redirect('/list-questions')

	}
})

app.get('/del-all', (req, res) => {
	questionSch.deleteMany({}, (err) => {
		if(err){
			console.log(err)
			res.send(err)
		}else{
			res.send('Operation Successful')
		}

	})
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

app.get('/find-auth-ip', (req, res) => {
	findIpInAuthIps(req.ip)
	res.send('Done')
})






 

// Database Checking NEXT 2
app.get('/show-Database', (req, res) => {
	questionSch.find({}, (err, data) => {
		if(err) res.send(err).status(500)
		res.json(data)
	})
})

app.get('/store-Database', (req, res) => {
	let ipAddToDb = new questionSch(req.query)
	ipAddToDb.save((err, task) => {
		if (err) {
		  res.status(500).send(err);
		}
		res.status(201).json(task);
	  })
})

app.get('/find-Database', (req, res) => {
	ipQuery = req.query.ip
	delIpInAuthIps(ipQuery)
	res.send('Request Complete') 
})


// 404 Handler
app.use((req, res) => {
	res.type('html')
	res.send('<h1><center>Not Found</center></h1>')
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
