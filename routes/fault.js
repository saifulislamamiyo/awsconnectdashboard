const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  res.render('fault', { title: 'Error' });
});

module.exports = router;