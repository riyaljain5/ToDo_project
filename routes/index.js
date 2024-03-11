var express = require('express');
var router = express.Router();
const userModel = require("./users");
const todoModel = require("./todo");
const passport = require('passport');
const localStrategy = require('passport-local');


passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error')});
});

router.post('/register', function(req, res) {
  const userData = new userModel({
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
  });

  userModel.register(userData, req.body.password, function(err, user) {
    if (err) {
      console.error('Error during user registration:', err);
      return res.redirect('/register');
    }

    passport.authenticate('local')(req, res, function() {
      res.redirect('/todo');
    });
  });
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/todo",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res) {
  console.log('Authentication successful. Redirecting to /todo');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.get('/todo', isLoggedIn, async function(req, res, next) {
  try {
    const userId = req.user._id;
    const todos = await todoModel.find({ userId });
    res.render('todo', { todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/addTodo', isLoggedIn, async (req, res) => {
  try {
    const title = req.body.title;
    const userId = req.user._id;
    const currentDateAndTime = new Date();

    const result = await todoModel.create({
      title: title,
      userId: userId,
      currentDateAndTime: currentDateAndTime
    });

    res.redirect('/todo');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get('/getUserData', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const todos = await todoModel.find({ userId });
    res.status(200).json({ todos });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/deleteTodo/:id', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const todoId = req.params.id;

    
    const todo = await todoModel.findOneAndDelete({ _id: todoId, userId });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const msInOneHour = 60*60*1000 ; // One hour in milliseconds


async function deleteOutdatedTodos() {
  try {
    const outdatedTodos = await todoModel.find({
      currentDateAndTime: { $lt: new Date(Date.now() - msInOneHour) }
    });

    if (outdatedTodos && outdatedTodos.length > 0) {
      for (const todo of outdatedTodos) {
        
        await todoModel.findByIdAndDelete(todo._id);
        console.log(`Deleted outdated todo with ID: ${todo._id}`);
      }
    }
  } catch (error) {
    console.error('Error deleting outdated todos:', error);
  }
}


setInterval(deleteOutdatedTodos, msInOneHour);

router.get('/getOutdatedTodos', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // One hour ago
    const outdatedTodos = await todoModel.find({ userId, currentDateAndTime: { $lt: oneHourAgo } });

    res.status(200).json({ outdatedTodos });
  } catch (error) {
    console.error('Error fetching outdated todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
