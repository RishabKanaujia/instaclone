require('dotenv').config()

var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStategy = require("passport-local");
const upload = require('./multer');
const cloudinary = require('cloudinary')

passport.use(new localStategy(userModel.authenticate()));


router.get('/', function (req, res) {
  res.render('index', { footer: false });
});

router.get('/login', function (req, res) {
  res.render('login', { footer: false });
});
router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  const posts = await postModel.find().populate("user");
  // console.log(posts,user);
  res.render('feed', { footer: true, posts, user });

});

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  res.render('profile', { footer: true, user });
});

// router.get('/footer', isLoggedIn, async function (req, res) {
//   const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
//   res.render('profile', { footer: true, user });
// });

router.get('/search', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })

  res.render('search', { footer: true,user });
});

router.get('/upload', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('upload', { footer: true, user });
});


router.get('/delete/post/:id', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })

  if (user.posts.includes(req.params.id)) {
    await postModel.deleteOne({ _id: req.params.id });
    const index = user.posts.indexOf(req.params.id)
    user.posts.splice(index, 1)

  }
  await user.save();
  res.redirect('/feed');
});

router.get('/like/post/:id', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.findOne({ _id: req.params.id });
  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.redirect('/feed');
});

router.get('/edit', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  // const userUpdate = await userModel.findOneAndUpdate({ username: req.session.passport.user },
  //   { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true });
  
  //   await userUpdate.save();
  res.render('edit', { footer: true, user });
});

router.get('/username/:username', isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, `i`);
  const users = await userModel.find({ username: regex });

  res.json(users);
});

router.post('/register', function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email
  });
  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile")
      })
    })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function (req, res) { });

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

router.post("/update", upload.single("image"), async function (req, res) {

  cloudinary.config({
    cloud_name: 'dbqla7rxg',
    api_key: '315861966216558',
    api_secret: '_ajdD-b4n_b57brooUP2jwWWe0Y'
  });
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads', // Cloudinary folder where the file will be stored

    });const user = await userModel.findOneAndUpdate({ username: req.session.passport.user },
      { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true });
  

 
    user.profileImage = result.url;

  await user.save();
  // console.log(profileImage);
  

    // console.log(result);

    //   res.send('File uploaded to Cloudinary successfully!');
  } catch (error) {

  }
  const user = await userModel.findOneAndUpdate({ username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true });

    await user.save();
  res.redirect("/profile");

});

router.post('/upload', upload.single("image"), isLoggedIn, async function (req, res) {
  cloudinary.config({
    cloud_name: 'dbqla7rxg',
    api_key: '315861966216558',
    api_secret: '_ajdD-b4n_b57brooUP2jwWWe0Y'
  });
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads', // Cloudinary folder where the file will be stored

    });
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.create({
      picture: result.url,
      user: user._id,
      caption: req.body.caption
    });
    user.posts.push(post._id);
    await user.save();

    console.log(result);

    //   res.send('File uploaded to Cloudinary successfully!');
  } catch (error) {

  }


  res.redirect("/feed");

});


router.get('/cloudinary', async function (req, res) {

  cloudinary.config({
    cloud_name: 'dbqla7rxg',
    api_key: '315861966216558',
    api_secret: '_ajdD-b4n_b57brooUP2jwWWe0Y'
  });

  cloudinary.uploader.upload('image', function (error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log(result);
    }
  });

  res.send("done");

});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}


module.exports = router;
