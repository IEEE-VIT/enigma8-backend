const router = require('express').Router();

const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// middleware- Check user is Logged in
const checkUserLoggedIn = (req, res, next) => {
    req.user ? next(): res.sendStatus(401);
  }

//profile
router.get('/', checkUserLoggedIn, async (req, res) => {
    res.render('profile', {user:req.user.displayName, task: await Task.find({sub: req.user.id}) })
});

//add a task
router.post('/add', jsonParser, checkUserLoggedIn, async (req, res) => {
  const task = new Task({        
      owner: req.user.displayName,
      description: req.body.add,
      sub: req.user.id
  })

  try {
      await task.save();
    res.redirect('/profile');
  } catch (e) {
      res.status(400).send(e)
  }
 
});


//delete a task
router.get('/tasks/delete/:id',jsonParser, checkUserLoggedIn, async (req, res) => {
    try {
        const task = await Task.deleteOne({_id: req.params.id})

        if (!task) {
            res.status(404).send()
        } 

        res.redirect('/profile')
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router;
