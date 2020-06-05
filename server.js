var app = require('express')();
var bodyParser = require('body-parser');
var firebase = require('firebase/app');
var database = require('firebase/database');
var auth = require('firebase/auth');
var jwt = require('jsonwebtoken');
var cors = require('cors')

app.use(cors()) 

const aposToLexForm = require('apos-to-lex-form');
const natural = require('natural');
const SW = require('stopword');

const SpellCorrector = require('spelling-corrector');

// const router = express.Router();

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();



var nodemailer = require('nodemailer');
var firebaseApp = firebase.initializeApp({
	apiKey: 'AIzaSyBfbNM0rUd0HXdp5uQYr0xyLIbGw1upvq8',
	authDomain: 'thewholesalebazaar-8e2fd.firebaseapp.com',
	databaseURL: 'https://thewholesalebazaar-8e2fd.firebaseio.com',
	projectId: 'thewholesalebazaar-8e2fd',
	storageBucket: 'thewholesalebazaar-8e2fd.appspot.com',
	messagingSenderId: '32251744535',
	appId: '1:32251744535:web:3969cfcf18bb64391aa752',
	measurementId: 'G-8S12ZWHGNM'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	console.log('test');
	res.send('<h1>Home page of our backend server </h1>');
});

function verifyToken(req, res, next) {
	console.log(req.body.mytoken);
	// req.token = req.body.mytoken;

	if (req.body.token) {
		next();
	} else {
		res.sendStatus(403);
	}

	//   // Forbidden

	//   //YAHAN JARAHA HAY
	//   res.sendStatus(403);
}

sendEmail = (reciever, sub, body) => {
	console.log(reciever + '\n' + sub + '\n' + body);
	let transporter = nodemailer.createTransport({
		service: 'gmail',

		auth: {
			user: 'k163614@nu.edu.pk', // generated ethereal user
			pass: 'silverbssasd' // generated ethereal password
		}
	});

	let info = transporter.sendMail({
		from: '"The Wholesale Bazaar 👻" <k163614@nu.edu.com>', // sender address
		to: reciever,
		subject: sub,
		html: body
	});
	console.log('Message sent: %s', info.messageId);

	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
getEmail = (itemData) => {
	firebase.database().ref('Users/' + itemData.retailerid + '/').on('value', (snapshot) => {
		var retailer = snapshot.val();
		//   email = retailer.email;
		email = 'yasir.112397@gmail.com';

		console.log('Email: ' + email);
		return email;
	});
};
getProductName = (itemData) => {
	var itemname;
	console.log('==============\n');
	console.log(itemData);

	firebase.database().ref('Product/' + itemData.itemid).on('value', (snapshot) => {
		var x = snapshot.val();
		//   email = retailer.email;
		itemname = x.name;
		email = 'yasir.112397@gmail.com';
		console.log('Itemname: ' + itemname);
		return itemname;
	});
};

//SIGN IN ROUTE.

app.post('/sendmail', (req, res) => {
	// res.send("Posted");
	console.log('posted');
	// console.log(req.body);

	let itemData = req.body.data;
	let quantity = itemData.quantity;
	let paymentMode = itemData.paymentmode;
	let delivery = itemData.deliveryaddress;
	let totalprice = itemData.totalprice;
	let wholesalername;

	var email;
	var itemname;

	console.log(itemData);
	console.log('--------------------\n' + email + '\n' + itemname);
	var i = 0;
	console.log('var i : ' + i);

	firebase.database().ref('Product/' + itemData.itemid + '/').once('value', (snapshot) => {
		var x = snapshot.val();
		var quantity = x.quantity;

		firebase
			.database()
			.ref('Product/' + itemData.itemid + '/')
			.update({
				quantity: quantity - itemData.quantity
			})
			.then(() => {
				console.log('---------------Insides firebasesss -------------');
				firebase.database().ref('Users/' + itemData.retailerid + '/').once('value', (snapshot) => {
					var retailer = snapshot.val();
					email = retailer.email;
					console.log('Email: ' + email);

					if (email != null) {
						sendEmail(
							email,
							'Order Recieved :)',
							'<b>Order Confirmed</b>' + '<hr><b>' + itemname + '\n' + '<b>'
						);
					} else {
						sendEmail(
							'k163614@nu.edu.pk',
							'Order Recieved :)',
							'<b>Order Confirmed</b>' + '<hr><b>' + itemname + '\n' + '<b>'
						);
					}
					res.send({ status: 'succesfuly posted' });
				});
			});
	});

	console.log('check');
	// firebase.database().ref("Product/"+itemData.itemid).on("value",(snapshot)=>{
	console.log('check2');
});

app.post('/login', function(req, res) {
	console.log('IN SIDE SIGN IN POST ASDA');
	console.log('5pm');

	var email = req.body.email;
	var password = req.body.password;

	let user = {
		email: email,
		password: password
	};

	var finaldata;
	console.log(user);
	firebase.default.auth().signInWithEmailAndPassword(email, password).then((data) => {
		jwt.sign({ data }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
			res.send({
				token,
				data
			});
		});
		//   res.send({
		//       data,
		//       token});
		// res.send(data);
	});
});

app.post('/loggedinuser', function(req, res) {
	console.log('LOGGED IN USER TOKEN APPI');
	var user = {
		email: req.body.email,
		password: req.body.password
	};
	console.log(user);
	jwt.sign({ user }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
		res.json({
			token
		});
	});
});

app.post('/signup', function(req, res) {
	console.log('TEST');
	var form = req.body.data;
	console.log(form.email);
	var email = form.email;

	sub = 'The Wholesale Bazaar - Email Confirmation Token! ';

	// var token  = 1234;

	var token = Math.floor(1000 + Math.random() * 9000);
	console.log('Token' + token);
	body = 'Your confirmation token is : ' + token;
	sendEmail(email, sub, body);
	res.send({ token: token });
});

app.get('/viewwholesalers/:id', function(req, res) {
	var i = 0;
	console.log('ITERATION # ' + i);
	i++;
	var productsOfThisWholesaler = [];

	var mergerObject = {};

	var wholesalerID = req.params.id;
	console.log(wholesalerID);

	firebase.database().ref('Users/' + wholesalerID).on('value', (snapshot) => {
		var user_ = snapshot.val();
		// res.send(user_);
		mergerObject['wholesalerdetail'] = user_;

		firebase.database().ref('Product/').on('value', (snapshot) => {
			var allProducts = snapshot.val();

			console.log('~~~~~~~~~~~~ALL PRODUCTS BY THIS WHOLESALER~~~~~');
			// console.log(allProducts);

			for (products in allProducts) {
				if (allProducts[products].wholesalerId === wholesalerID) {
					console.log('Called -_-');
					var temp = {
						name: allProducts[products].name,
						productId: products,
						category: allProducts[products].category,
						imgUrl: allProducts[products].imgUrl,
						isBuyNowPayLater: allProducts[products].isBuyNowPayLater,
						offerPrice: allProducts[products].offerPrice,
						price: allProducts[products].price,
						quantity: allProducts[products].quantity,
						wholesalerId: allProducts[products].wholesalerId,
						dateProductAddedIn: allProducts[products].dateProductAddedIn
					};
					console.log(temp)
					productsOfThisWholesaler.push(temp);
				}
			}

			mergerObject['wholesalerproducts'] = productsOfThisWholesaler;
			// res.send(productsOfThisWholesaler);
		});
	});

	//Response JSON
	res.send(mergerObject);
});





app.get('/viewproducts', function(req, res) {
	// res.send('ok');
	var sendingdetails = [];
	firebase.database().ref('Product/').on('value', (snapshot) => {
		var products = snapshot.val();

		for (i in products) {
			var prod = {
				productId: i,
				category: products[i].category,
				imgUrl: products[i].imgUrl,
				isBuyNowPayLater: products[i].isBuyNowPayLater,
				name: products[i].name,
				offerPrice: products[i].offerPrice,
				price: products[i].price,
				quantity: products[i].quantity,
				tags: products[i].tags,
				wholesalerId: products[i].wholesalerId
			};

			sendingdetails.push(prod);
			console.log(sendingdetails);
		}
		res.send(sendingdetails);
	});
});

app.post('/recieveorder/', function(req, res) {
	var product = req.body.product;
	var customerdetail = req.body.customerdetails;
	console.log(product);

	firebase
		.database()
		.ref('Order/')
		.push({
			// retailerid:"external_",aile
			productid: product.productId,
			quantity: customerdetail.quantityRequired,
			status: 'pending',
			wholesalerid: product.wholesalerId, // priduc id se wholesaler id nikal aur phir set
			retailerid: 'product.userid',
			paymentmode: customerdetail.paymentMode,
			deliveryaddress: customerdetail.deliveryAddress,
			totalprice: product.price * customerdetail.quantityRequired
		})
		.then((data) => {
			//kar yahan pe quantity change
			firebase
				.database()
				.ref('Product/' + product.productId + '/')
				.once('value', (snapshot) => {
					var x = snapshot.val();
					var quantity = x.quantity;

					firebase.database().ref('Product/' + product.productId + '/').update({
						quantity: quantity - customerdetail.quantityRequired
					});
				})
				.catch((error) => {
					//error callback
					console.log('error ', error);
				});
		});

	console.log('Done!');
	res.send({ success: 'succesfull' });

	// res.send(req.params.id)
});

/// ALL ROUTES THAT NEED TOKEN OTHERWISE FOREBIDDEN

app.post('/checkverify', verifyToken, (req, res) => {
	console.log('Check verification');
	jwt.verify(req.body.mytoken, 'secretkey', (err, authData) => {
		console.log(req.token);

		if (err) {
			console.log('Forbidden');
			res.sendStatus(403);
		} else {
			console.log('Allowed');
			res.send({ allowed: 'true' });
		}
	});
});

async function updateProductReview(productid){
	console.log("IN COMMENTS");
	var intensity = 0;
	//??????
   firebase.database().ref('comments/'+productid).on('value',(snapshot)=>{
	  
	   var comments=snapshot.val();
	   var totalsentiment =0;
		var percentage = 0.0;
		console.log(comments);
		var length =1;
		console.log("LengthL : " + length);
		if(length>0){
			for ( comment in comments){
				var sentimentval=sentiment(comments[comment].commentText)
				length+=1
				totalsentiment+=sentimentval;
			}
		}
		firebase.database().ref("Product/"+productid).update({'sentiment':totalsentiment});
   })
}

app.post('/addcomment', function(req, res) {
	console.log('Add COmment ');

	console.log(req.body.userid);
	console.log(req.body.comment);
	console.log(req.body.productid);

//get sentiment value of comment
var sentimentval=sentiment(req.body.comment);
	
	firebase
		.database()
		.ref('/comments/' + req.body.productid)
		.push({
			userid: req.body.userid,
			commentText: req.body.comment,
			sentimentvalue: sentimentval
		})
		.then((data) => {
			//success callback
            // console.log('data ' , data)
            console.log('-------------------------------here1--------------------------')
            sendData = true;
		    console.log("~~~DONE~~~~~~~~~~~~~~~~~~~~~~~~");
            
		})
		.catch((error) => {
            //error callback
            console.log('-------------------------------here2--------------------------')
			// res.send('not sent')
			console.log('error ', error);
		});

		console.log("going back now, tired!");
		updateProductReview(req.body.productid);
	res.send("ADDED THE COMMENT SUCCESS");
});
  getValues=(productid)=>{
	var jsonsend={};
	console.log('-------------inside get-------------')
	var comments = {};
    firebase.database().ref('comments/' + productid).on('value', (snapshot) => {
		var snapval = snapshot.val();
		var comments = [];
		var com = {};
		var sendStatus = false;
		

		for (i in snapval) {
			comments.push(snapval[i]);
		}

		firebase.database().ref('Users/').on('value', (snapshot) => {
			var snapval = snapshot.val();
			var users = [];
            var sendcomments = [];
            console.log('-------------------------------here4--------------------------')
			for (i in comments) {
				// console.log();

				sendcomments.push({
					username: snapval[comments[i]['userid']]['username'],
					usertype: snapval[comments[i]['userid']]['as'],
					comment: comments[i]['commentText']
				});
            }
             //out of scope hojayeag to barhe krde
            
			jsonsend['comments'] = sendcomments;
            console.log('-------------------------------here5--------------------------')
		
			console.log(jsonsend);
			comments = jsonsend;

			sendStatus = true;
			return jsonsend;
		
		});
		// console.log('---------------------------outside ------------------------')
		// console.log(jsonsend)
		// return comments;
		
        // console.log('-------------------------------sendinggg--------------------------');

    });
  
};
app.get('/comments/:productid',  function(req, res) {
	console.log('Inside Comments / product id');
    //comment username
	
	var jsonsend={};
	console.log('-------------inside get-------------')
	var comments = {};
	var productid=req.params.productid;
    firebase.database().ref('comments/' + productid).on('value', (snapshot) => {
		var snapval = snapshot.val();
		var comments = [];
		var com = {};
		var sendStatus = false;
		

		for (i in snapval) {
			comments.push(snapval[i]);
		}

		firebase.database().ref('Users/').on('value', (snapshot) => {
			var snapval = snapshot.val();
			var users = [];
            var sendcomments = [];
            console.log('-------------------------------here4--------------------------')
			for (i in comments) {
				// console.log();

				sendcomments.push({
					username: snapval[comments[i]['userid']]['username'],
					usertype: snapval[comments[i]['userid']]['as'],
					comment: comments[i]['commentText']
				});
            }
             //out of scope hojayeag to barhe krde
            
			jsonsend['comments'] = sendcomments;
            console.log('-------------------------------here5--------------------------')
		
			console.log(jsonsend);
			comments = jsonsend;

			sendStatus = true;
			// return jsonsend;
		

		});
	

    });


	console.log("RES . SEND");
	res.send(jsonsend);
	
   

});



// orders api


app.get('/orders/',function(req,res){
    console.log("In Orders");
    var Orders={}
    firebase.database().ref('Order/').on('value',(snapshot)=>{
        var orders=snapshot.val();
        //extracting wholesaler from order

            firebase.database().ref('Users/').on("value",snapshot=>{
                var wholesaler=snapshot.val();

                for(var i in orders){
                    orders[i]['wholesalerinfo']=wholesaler[orders[i]['wholesalerid']]
                }
                firebase.database().ref('Product/').on("value",(snapshot)=>{
                    var products=snapshot.val();
    
                    for(var i in orders){
                        orders[i]['productinfo']=products[orders[i]['productid']]
                    }
                    firebase.database().ref('Users/').on("value",snapshot=>{
                        var wholesaler=snapshot.val();
                        for(var i in orders){
                            orders[i]['retailerinfo']=wholesaler[orders[i]['retailerid']]
                        }
                        res.send(orders);          
                    })

                })

                    
            })


        //extract product info from productid

        //extract retailer info from retailer id


    })
})

app.get('/order/:wholesalerid',function(req,res){
	console.log("----------------------->In Orders");
	console.log("1010101010101010101001100110")
	var wholesalerid = req.params.wholesalerid;
	console.log(wholesalerid)
    
    var Orders={}
    firebase.database().ref('Order/').on('value',(snapshot)=>{
		
		var orders=snapshot.val();
	//	console.log(orders)
		var finalOrders = [];

		for(order in orders){
			// console.log(orders[order]['wholesalerid'])
			if(orders[order]['wholesalerid']==(wholesalerid)){
				finalOrders.push(orders[order]);
				console.log(finalOrders);
			}
		}
	console.log("1010101010101010101001100110")

		res.send(finalOrders);
	})
	
})









function sentiment(review){
	const lexedReview = aposToLexForm(review);
	const casedReview = lexedReview.toLowerCase();
	const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');
  
	const { WordTokenizer } = natural;
	const tokenizer = new WordTokenizer();
	const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
  
	tokenizedReview.forEach((word, index) => {
	  tokenizedReview[index] = spellCorrector.correct(word);
	})
	const filteredReview = SW.removeStopwords(tokenizedReview);
  
	const { SentimentAnalyzer, PorterStemmer } = natural;
	const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
	const analysis = analyzer.getSentiment(filteredReview);
    return analysis;
}


app.post('/getsentiment',function(req,res){

	var sentimentval=sentiment(req.body.comment);
	console.log('-----------------------')
	console.log(sentimentval)
	res.status(200).json({ sentimentval });
})


app.post('/developersignup',function(req,res){


// signup with email and password KARRRRRR>
     var user =req.body.user;

	 var password = user.password;
	 console.log(user.password);

	var userDetails = {		
		name : user.name,
		email : user.email,
		mobile : user.mobile,
		businessname: user.businessname,
		businessaddress: user.businessaddress,
		message: user.message,
		businessURL: user.businessURL,
		as: "developer",
		officecontact:user.officecontact,
		confirmedAccess : false
	}



	firebase.database().ref("Developers/").push(userDetails).then((user1)=>{
		// console.log(user)
		firebase
		.auth()
		.createUserWithEmailAndPassword(user.email, password)
		
		.then((data) => console.log('user added'))
		
		.catch((error) => console.log(error));
		
	}).catch(error=>{
		console.log(error)
	});
});

const stripe = require('stripe')("sk_test_WUzPlklrvJTNUWxyNydpC4kX008qPBkKR4");
app.post('/doPayment/', (req, res) => {


	
	console.log("in do payment api");

	console.log("CUSETOMER EMIAL :  :  :  "  + req.body.email);

	console.log(req.body.amount)
  	return stripe.customers.create({
    email: req.body.email,
	source: req.body.tokenId,
	id:req.body.customerId
	
  })
  .then(customer => {
    stripe.charges.create({
      amount: req.body.amount *100, // Unit: cents
      currency: 'pkr',
      customer: customer.id,
      source: customer.default_source.id,
	  description: 'Test payment',
	
    })
  })
  .then(result => res.status(200).json(result))
});


app.listen(3000, () => {
	console.log('Listening');
});


