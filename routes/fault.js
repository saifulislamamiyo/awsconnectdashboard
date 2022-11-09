const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const x = 1;
    x = 0
    res.render('fault', { title: 'Error' });
  } catch (e) {
    res.render("error", {message: "Haha", error:"GAGA"})
  }
});

module.exports = router;