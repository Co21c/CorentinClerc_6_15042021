const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
      .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => req.status(500).json({ error }))
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.like = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    switch(req.body.like) {
      case 1:
        if(!sauce.usersLiked.includes(req.body.userId))
        sauce.likes++
        sauce.usersLiked.push(req.body.userId)
      break;
      case -1:
        if(!sauce.usersDisliked.includes(req.body.userId))
        sauce.dislikes++
        sauce.usersDisliked.push(req.body.userId)
      break;
      case 0: 
        if(sauce.usersLiked.includes(req.body.userId)) {
          let indexLiked = sauce.usersLiked.indexOf(req.body.userId)
          sauce.likes--
          sauce.usersLiked.splice(indexLiked, 1)
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          let indexDisliked = sauce.usersDisliked.indexOf(req.body.userId)
          sauce.dislikes--
          sauce.usersDisliked.splice(indexDisliked, 1)
        }
      break;
    }
    Sauce.updateOne({ _id: req.params.id }, sauce)
    .then(() => res.status(200).json({ message: 'sauce saved' }))
    .catch(error => res.status(400).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
}


