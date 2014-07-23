var ls = require('./lightstrip');

var NUM_PIXELS = 32;

var pixelsHSV = new Array(NUM_PIXELS);

function temperatureToHue(tempF) {
  if (tempF > 115)
    tempF = 115;
  if (tempF < 10)
    tempF = 10;

  return .9 - .9 * (tempF - 10)/(115-10);
};

/**
 * DI wrapper
 * @param {Express} app
 */
module.exports = function(app) {
  app.post('/api/pixels', function(req, res) {
    if (!req.body.values)
      return res.json(400, 'Need to specify pixel values');

    if (!isArray(req.body.values))
      return res.json(400, 'Values must be an array!');

    for (var i=0; i<NUM_PIXELS; i++) {
      var pixel = req.body.values[i];

      // specifying a temperature
      if (typeof pixel === 'number') {
        pixelsHSV[i] = [temperatureToHue(pixel), 1, 1];

      } else if (typeof pixel === 'object') {
        pixelsHSV[i] = [pixel.h || 0, pixel.s || 0, pixel.v || .2]; // default pixel is dim white

      } else {
        pixelsHSV[i] = [0,0,0];  // default off for any remaining unspecified pixels
      }
    }

    ls.next();
    pixelsHSV.forEach(function(pixel) {
      ls.HSV.apply(ls, pixel);
    });

    return res.json(200, 'updated');
  });
};