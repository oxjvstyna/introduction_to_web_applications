const express = require('express');
const {
	json,
	response
} = require("express");
const app = express();
const sqlite3 = require('sqlite3').verbose();
let sql;

app.use(express.json());
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(cors());
// app.use(bodyParser.json());

const db = new sqlite3.Database('Database.db', err => {
	if (err) {
		return console.error(err.message);
	}
});
//tworzenie tabel
// sql= `CREATE TABLE products(id INTEGER PRIMARY KEY, title,price,category,description,image,rating)`;
// db.run(sql);
// sql=`CREATE TABLE users(id INTEGER PRIMARY KEY, username,password)`
// db.run(sql);
// sql=`CREATE TABLE productsInBuckets(userID,productID)`
// db.run(sql);
// sql= `CREATE TABLE comments(id INTEGER PRIMARY KEY,userID,productID,data,body,rating)`;
// db.run(sql);
// db.run(`CREATE TABLE productsInCarts(userID,productID,quantity)`);
// sql = `CREATE TABLE orders(id INTEGER PRIMARY KEY, userID, productID,quantity,data,price)`;
// db.run(sql);


// USERS

const secretKey = 'your_secret_key';

app.post('/api/acceptCart/:uid', (req, res) => {
	const userId = parseInt(req.params.uid, 10);
	const getCartSql = `
        SELECT c.productID, c.quantity, p.price
        FROM productsInCarts c
        JOIN products p ON c.productID = p.id
        WHERE c.userID = ?`;


	db.all(getCartSql, [userId], (err, rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error fetching cart."
			});
		}


		if (rows.length === 0) {
			return res.status(400).json({
				message: "Your cart is empty."
			});
		}


		const insertOrderSql = `INSERT INTO orders (userID, productID, quantity, price, data)
                                VALUES (?, ?, ?, ?, ?)`;

		const now = new Date().toISOString();
		const promises = rows.map((item) => {
			return new Promise((resolve, reject) => {
				db.run(insertOrderSql, [userId, item.productID, item.quantity, item.price, now], function(err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.lastID);
					}
				});
			});
		});


		Promise.all(promises)
			.then(() => {
				const deleteCartSql = 'DELETE FROM productsInCarts WHERE userID = ?';
				db.run(deleteCartSql, [userId], (err) => {
					if (err) {
						console.error(err.message);
						return res.status(500).json({
							message: "Error clearing cart."
						});
					}
					res.status(200).json({
						message: "Order placed successfully and cart cleared!"
					});
				});
			})
			.catch((err) => {
				console.error(err.message);
				res.status(500).json({
					message: "Error placing order."
				});
			});
	});
});


app.delete('/api/productsInCarts/:id/:uid', (req, res) => {
	const productId = parseInt(req.params.id, 10);
	const userId = parseInt(req.params.uid, 10);
	const sql = 'DELETE FROM productsInCarts WHERE productID = ? AND userID = ?';

	db.run(sql, [productId, userId], (err) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error removing product from cart."
			});
		}
		res.status(200).json({
			message: `Product with ID: ${productId} has been removed from the cart.`
		});
	});
});



app.get('/api/productsInCarts/:uid', (req, res) => {
	const userId = parseInt(req.params.uid, 10);
	const sql = `
        SELECT p.id AS productID, p.title, p.price, p.image, p.category, p.description, p.rating, c.quantity
        FROM productsInCarts c
        JOIN products p ON c.productID = p.id
        WHERE c.userID = ?`;
	db.all(sql, [userId], (err, rows) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			products: rows
		});
	});
});


app.post('/login', (req, res) => {
	const {
		username,
		password
	} = req.body;
	if (!username || !password) {
		return res.status(400).json({
			message: "Username and password are required."
		});
	}

	sql = 'SELECT * FROM users WHERE username = ?';
	db.get(sql, [username], (err, user) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error fetching user."
			});
		}
		if (!user) {
			return res.status(404).json({
				message: "User not found."
			});
		}

		bcrypt.compare(password, user.password, (err, result) => {
			if (err) {
				console.error(err.message);
				return res.status(500).json({
					message: "Error comparing passwords."
				});
			}
			if (!result) {
				return res.status(401).json({
					message: "Invalid password."
				});
			}

			const token = jwt.sign({
				userId: user.id
			}, secretKey, {
				expiresIn: '1h'
			});
			res.status(200).json({
				message: "Login successful!",
				token
			});
		});
	});
});


app.post('/register', async (req, res) => {
	const {
		username,
		password
	} = req.body;

	if (!username || !password) {
		return res.status(400).json({
			message: "Username and password are required."
		});
	}


	const checkSql = `SELECT * FROM users WHERE username = ? OR password = ?`;
	db.get(checkSql, [username, password], (err, row) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Database error."
			});
		}

		if (row) {

			return res.status(400).json({
				message: "Username or password already exists. Please choose another.",
			});
		}


		const insertSql = `INSERT INTO users (username, password) VALUES (?, ?)`;
		db.run(insertSql, [username, password], function(err) {
			if (err) {
				console.error(err.message);
				return res.status(500).json({
					message: "Error registering user."
				});
			}
			res.status(201).json({
				message: "User registered successfully!",
				userId: this.lastID,
			});
		});
	});
});


app.get('/api/users', (req, res) => {
	sql = 'SELECT * FROM users';
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.log(err.message);
		}
		res.status(200).json({
			message: 'Wszyscy użytkownicy: ',
			users: rows
		})
	})
})

app.get('/api/products', (req, res) => {
	sql = 'SELECT * FROM products';
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.log(err.message);
		}
		res.status(200).json({
			message: 'Wszystkie produkty: ',
			products: rows
		})
	})
})

app.delete('/api/users/:id', (req, res) => {
	const userid = parseInt(req.params.id, 10);
	sql = `DELETE FROM users WHERE id = ?`;
	db.run(sql, [userid], err => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto uzytkownika o id: ' + userid
		})
	})
})

// PRODUCTS


app.post('/api/products', (req, res) => {

	fetch('https://fakestoreapi.com/products')
		.then(response => response.json())
		.then(data => {
			const promises = data.map(product => {
				const {
					title,
					price,
					category,
					description,
					image,
					rating
				} = product;
				const ratingCount = rating.count;
				sql = `INSERT INTO products(title, price, category, description, image, rating)
                       VALUES (?, ?, ?, ?, ?, ?)`;
				return new Promise((resolve, reject) => {
					db.run(sql, [title, price, category, description, image, ratingCount], function(err) {
						if (err) {
							reject(err);
						} else {
							resolve(this.lastID)
						}
					});
				});
			});
			return Promise.all(promises);
		})
		.then(ids => {
			res.status(200).json({
				message: 'Produkty zostały dodane',
				ids
			});
		})
});


app.get('/api/products/:id', (req, res) => {
	const productId = parseInt(req.params.id, 10);
	sql = 'SELECT * FROM products WHERE id = ?';
	db.get(sql, [productId], (err, row) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error fetching product details."
			});
		}
		if (!row) {
			return res.status(404).json({
				message: "Product not found."
			});
		}
		res.status(200).json({
			product: row
		});
	});
});



app.delete('/api/products/:id', (req, res) => {

	const prodid = parseInt(req.params.id, 10);
	sql = `DELETE FROM products WHERE id = ?`;
	db.run(sql, [prodid], (err, rows) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto produkt o id: ' + prodid
		})
	})
})

app.delete('/api/products', (req, res) => {
	sql = `DELETE FROM products`;
	db.all(sql, (err) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto produkty'
		})
	})
})
//PRODUCTS IN BUCKETS


app.post('/productsInCarts', async (req, res) => {
	const {
		userid,
		productid,
		quantity
	} = req.body;
	if (!userid || !productid || !quantity) {
		return res.status(400).json({
			message: "userID, quantity and productID are required."
		});
	}

	sql = `INSERT INTO productsInCarts (userID, productID, quantity) VALUES (?, ?, ?)`;
	db.run(sql, [userid, productid, quantity], function(err) {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error appending product to bucket."
			});
		}
		res.status(201).json({
			message: "Product appended successfully!"
		});
	});
});


app.get('/api/productsInCarts', (req, res) => {
	sql = 'SELECT * FROM productsInCarts';
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.log(err.message);
		}
		res.status(200).json({
			message: 'Wszystkie produkty z koszyków Carts: ',
			productsInCarts: rows
		});
	});
});

app.get('/api/productsInCarts/:uid', (req, res) => {
	const userId = parseInt(req.params.uid, 10);
	sql = 'SELECT * FROM productsInCarts WHERE userID = ?';
	db.all(sql, [userId], ((err, rows) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			products: rows
		})
	}))
})

app.delete('/productsInCarts/:id/:uid', (req, res) => {

	const prodid = parseInt(req.params.id, 10);
	const userid = parseInt(req.params.uid, 10)
	sql = `DELETE FROM productsInCarts WHERE productID = ? AND userID = ?`;
	db.run(sql, [prodid, userid], (err, rows) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto produkt z koszyka o id: ' + prodid + 'dla uzytkownika: ' + userid
		})
	})
})

// COMMENTS


app.post('/api/comments', (req, res) => {
	const {
		userid,
		productid,
		data,
		body,
		rating
	} = req.body;
	if (!userid || !productid || !body || !rating) {
		return res.status(400).json({
			message: "userid, productid, data, body and rating are required."
		})
	}
	sql = `INSERT INTO comments (userID, productID, data, body, rating) VALUES (?,?,?,?,?)`;
	db.run(sql, [userid, productid, data, body, rating], function(err) {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error adding a comment."
			});
		}
		res.status(201).json({
			message: "comment appended successfully!"
		});
	});
})

app.get('/api/comments', (req, res) => {
	sql = 'SELECT * FROM comments';
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.log(err.message);
		}
		res.status(200).json({
			message: 'Wszystkie opinie: ',
			productsInBuckets: rows
		});
	})
})

app.get('/api/comments/:id', (req, res) => {
	const prodId = parseInt(req.params.id, 10);
	const sql = `
        SELECT c.*, u.username 
        FROM comments c 
        JOIN users u ON c.userID = u.id 
        WHERE c.productID = ?`;

	db.all(sql, [prodId], (err, rows) => {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error fetching comments."
			});
		}
		res.status(200).json({
			productId: prodId,
			comments: rows
		});
	});
});

app.delete('/api/comments/:id', (req, res) => {
	const commentId = parseInt(req.params.id, 10);

	sql = 'DELETE FROM comments WHERE id = ?';
	db.run(sql, [commentId], (err, row) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto opinie o id: ' + commentId
		})
	})
})

app.put('/api/comments/:uid/:pid', async (req, res) => {
	const userID = parseInt(req.params.uid, 10);
	const productID = parseInt(req.params.pid, 10);
	const {
		newBody,
		newRating,
		data
	} = req.body;

	sql = 'UPDATE comments SET body = ?, rating = ?, data = ? WHERE userID = ? AND productID = ?';
	db.run(sql, [newBody, newRating, data, userID, productID], function(err) {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error editing the comment."
			});
		}
		res.status(201).json({
			message: "opinion edited successfully!"
		});
	});
})



app.delete('/api/comments/:uid/:pid', (req, res) => {
	const userID = parseInt(req.params.uid, 10);
	const productID = parseInt(req.params.pid, 10);


	sql = 'DELETE FROM comments WHERE userID = ? AND productID=?';
	db.run(sql, [userID, productID], (err, row) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto opinie'
		})
	})
})
// ORDERS

app.get('/api/orders', (req, res) => {
	sql = `SELECT * FROM orders`;
	db.all(sql, [], (err, rows) => {
		if (err) {
			return console.log(err.message);
		}
		res.status(200).json({
			message: 'Wszystkie zamównia: ',
			orders: rows
		});
	})
})

app.post('/api/orders', (req, res) => {
	const {
		userID,
		productID,
		quantity,
		data,
		price
	} = req.body;
	if (!userID || !productID || !quantity || !data || !price) {
		return res.status(400).json({
			message: "userid,productid,data,quantity and price are required."
		})
	}
	sql = `INSERT INTO orders (userID, productID,quantity,data,price) VALUES (?,?,?,?,?)`;
	db.run(sql, [userID, productID, quantity, data, price], function(err) {
		if (err) {
			console.error(err.message);
			return res.status(500).json({
				message: "Error adding an order."
			});
		}
		res.status(201).json({
			message: "order appended successfully!"
		});
	});
})

app.delete('/api/orders/:id', (req, res) => {
	const orderID = parseInt(req.params.id, 10);

	sql = 'DELETE FROM orders WHERE id = ?';
	db.run(sql, [orderID], (err, row) => {
		if (err) {
			return console.error(err.message);
		}
		res.status(200).json({
			message: 'Usunięto zamówienie o id: ' + orderID
		})
	})
})


const PORT = 5000;
app.listen(PORT, () => {
	console.log("Serwer włączony!");
});