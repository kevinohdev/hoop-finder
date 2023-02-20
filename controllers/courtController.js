const mongoose = require('mongoose');
const Court = mongoose.model('Court');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true);
    } else {
      next({ message: 'That filetype is not allowed'}, false);
    }
  }
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  next();
}

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addCourt = (req, res) => {
  res.render('editCourt', { title: 'Add Court' })
}

exports.createCourt = async (req, res) => {
  req.body.author = req.user._id;
  const court = await (new Court(req.body)).save();
  await court.save();
  req.flash('success', `Sucessfully created ${court.name}.`)
  res.redirect(`/court/${court.slug}`);
}

exports.getCourt = async (req, res) => {
  const courts = await Court.find();
  console.log(courts);
  res.render('courts', { title: 'Courts', courts })
}

const confirmOwner = (court, user) => {
  if(!court.author.equals(user._id)) {
    throw Error('You must be the author of this court to edit it.')
  }
};

exports.editCourt = async (req, res) => {
  const court = await Court.findOne({_id: req.params.id});
  confirmOwner(court, req.user);
  res.render('editCourt', { title: `Edit ${court.name}`, court});
}

exports.updateCourt = async (req, res) => {
  req.body.location.type = 'Point';
  const court = await Court.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true,
    runValidators: true
  }).exec();

  req.flash('success', `Updated ${court.name} <a href="/courts/${court.slug}"> View Court </a>`);
  res.redirect(`/courts/${court._id}/edit`);
};

exports.getCourtBySlug = async (req, res, next) => {
  const court = await Court.findOne({ slug: req.params.slug }).
  populate('author reviews');
  if(!court) return next(); 
  res.render('court', { court, title: court.name }); 
};

exports.getCourtsByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true, $ne: [] };

  const tagsPromise = Court.getTagsList();
  const courtsPromise = Court.find({ tags: tagQuery });
  const [tags, courts] = await Promise.all([tagsPromise, courtsPromise]);


  res.render('tag', { tags, title: 'Tags', tag, courts });
};

exports.searchCourts = async (req, res) => {
  const courts = await Court
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  .sort({
    score: { $meta: 'textScore' }
  })
  .limit(5);
  res.json(courts);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };

  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map'});
};

exports.heartCourt = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
  .findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.hearts = async (req, res) => {
  const courts = await Court.find(
    {
      _id: { $in: req.user.hearts }
    }
  );

  res.render('courts', { title: 'Favorite Courts', courts})
};

exports.getTopCourts = async (req, res) => {
  const courts = await Court.getTopCourts();
  res.render('topCourts', { courts, title:'⭐ Top Courts!'});
};