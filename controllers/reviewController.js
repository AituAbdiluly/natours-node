const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getReviews = catchAsync(async function (req, res, next) {
  let filter = {};

  if (req.params.tourID) filter = { tour: req.params.tourID };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async function (req, res, next) {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;
  console.log(req.body.tour, req.body.user);

  const newReview = await Review.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});