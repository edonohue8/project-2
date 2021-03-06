// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  //route for posting or adding an item
  app.post("/api/itemPost", (req, res) => {
    db.Item.create({
      itemName: req.body.itemName,
      category: req.body.category,
      contact: req.body.contact,
      description: req.body.description
    }).then(item => {
      // respond back with the item id
      res.json(item.id);
    });
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
        name: req.user.name
      });
    }
  });

  // Need route to delete user WITH items associated with user
  // this code alone shall be able to delte user and everything associated with user like user items

  //route for posting or adding an item
  app.post("/api/item_post", (req, res) => {
    console.log(req.body.UserId);
    db.Item.create({
      itemName: req.body.itemName,
      category: req.body.category,
      contact: req.body.contact,
      description: req.body.description
    }).then(item => {
      // respond back with the item id
      res.json(item.id);
    });
  });

  // Route for viewing all items and associate with users that post them
  // need foreign key in MySQL tables
  app.get("/api/item_data", (req, res) => {
    const query = {};
    if (req.query.user_id) {
      query.UserId = req.query.user_id;
    }
    db.Item.findAll({
      where: query,
      include: [db.User]
    }).then(items => {
      res.json(items);
    });
  });

  // Need route for pulling a specified item from db (when user wants to view it)
  app.get("/api/item_data/:id", (req, res) => {
    db.Item.findOne({
      where: {
        id: req.params.id
      },
      include: [db.User]
    }).then(items => {
      res.json(items);
    });
  });

  // Need route to view items by category (needs editing)
  app.get("/api/item_data/:category", (req, res) => {
    db.Item.findOne({
      include: db.User
    }).then(items => {
      res.json(items);
    });
  });

  // Need route to view items listed under user
  app.get("/api/user_data/:id", (req, res) => {
    db.User.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Item]
    }).then(userItems => {
      res.json(userItems);
    });
  });

  // Need route to delete item
  //might not need this due to line 66 being responsible for deleting all of user and everything associated with user
  app.delete("/api/item_data/:id", (req, res) => {
    db.Item.destroy({
      where: {
        id: req.params.id
      }
    }).then(dbItem => {
      res.json(dbItem);
    });
  });
};
