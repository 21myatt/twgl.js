var path      = require('path');
var requirejs = require('requirejs');
var should    = require('should');

requirejs.config({
  nodeRequire: require,
  baseUrl: path.normalize(path.join(__dirname, '../../../src')),
});

var m4 = requirejs('./m4');

function check() {
  var m = [
     0,  1,  2,  3,
     4,  5,  6,  7,
     8,  9, 10, 11,
    12, 13, 14, 15,
  ];

  function testM4WithoutDest(func, expected) {
    var d = func();
    d.should.eql(expected);
  }

  function testM4WithDest(func, expected) {
    var d = new Float32Array(16);
    var c = func(d);
    c.should.be.equal(d);
    c.should.be.eql(expected);
  }

  function testM4WithAndWithoutDest(func, expected) {
    expected = new Float32Array(expected);
    testM4WithoutDest(func, expected);
    testM4WithDest(func, expected);
  }

  function testV3WithoutDest(func, expected) {
    var d = func();
    d.should.eql(expected);
  }

  function testV3WithDest(func, expected) {
    var d = new Float32Array(3);
    var c = func(d);
    c.should.be.equal(d);
    c.should.be.eql(expected);
  }

  function testV3WithAndWithoutDest(func, expected) {
    expected = new Float32Array(expected);
    testV3WithoutDest(func, expected);
    testV3WithDest(func, expected);
  }

  it('should negate', function() {
    var expected = [
      -0,  -1,  -2,  -3,
      -4,  -5,  -6,  -7,
      -8,  -9, -10, -11,
     -12, -13, -14, -15,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.negate(m, dst);
    }, expected);
  });

  it('should copy', function() {
    var expected = m;
    testM4WithAndWithoutDest(function(dst) {
      var result = m4.copy(m, dst);
      should.notStrictEqual(result, m);
      return result;
    }, expected);
  });

  it('should make identity', function() {
    var expected = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.identity(dst);
    }, expected);
  });

  it('should transpose', function() {
    var expected = [
      0, 4, 8, 12,
      1, 5, 9, 13,
      2, 6, 10, 14,
      3, 7, 11, 15,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.transpose(m, dst);
    }, expected);
  });

// TODO inverse
// TODO multiply

  it('should set translation', function() {
    var expected = [
      0,  1,  2,  3,
      4,  5,  6,  7,
      8,  9, 10, 11,
     11, 22, 33, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.setTranslation(m, [11, 22, 33], dst);
    }, expected);
  });

  it('should get translation', function() {
    var expected = [12, 13, 14];
    testV3WithAndWithoutDest(function(dst) {
      return m4.getTranslation(m, dst);
    }, expected);
  });

  it('should get axis', function() {
    var expected = [
      [0, 1, 2],
      [4, 5, 6],
      [8, 9, 10],
    ].forEach(function(expected, ndx) {
      testV3WithAndWithoutDest(function(dst) {
        return m4.getAxis(m, ndx, dst);
      }, expected);
    });
  });

  it('should compute perspective', function() {
    var fov = 2;
    var aspect = 4;
    var zNear = 10;
    var zFar = 30;
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    var rangeInv = 1.0 / (zNear - zFar);
    var expected = [
      f / aspect,
      0,
      0,
      0,

      0,
      f,
      0,
      0,

      0,
      0,
      (zNear + zFar) * rangeInv,
      -1,

      0,
      0,
      zNear * zFar * rangeInv * 2,
      0,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.perspective(fov, aspect, zNear, zFar, dst);
    }, expected);
  });

  it('should compute ortho', function() {
    var left = 2;
    var right = 4;
    var top = 10;
    var bottom = 30;
    var near = 15;
    var far = 25;
    var expected = [
      2 / (right - left),
      0,
      0,
      0,

      0,
      2 / (top - bottom),
      0,
      0,

      0,
      0,
      -1 / (far - near),
      0,

      (right + left) / (left - right),
      (top + bottom) / (bottom - top),
      -near / (near - far),
      1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.ortho(left, right, bottom, top, near, far, dst);
    }, expected);
  });

  it('should compute frustum', function() {
    var left = 2;
    var right = 4;
    var top = 10;
    var bottom = 30;
    var near = 15;
    var far = 25;

    var dx = (right - left);
    var dy = (top - bottom);
    var dz = (near - far);

    var expected = [
      2 * near / dx,
      0,
      0,
      0,
      0,
      2 * near / dy,
      0,
      0,
      (left + right) / dx,
      (top + bottom) / dy,
      far / dz,
      -1,
      0,
      0,
      near * far / dz,
      0,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.frustum(left, right, bottom, top, near, far, dst);
    }, expected);
  });

// TODO lookAt

  it('should make translation matrix', function() {
    var expected = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      2, 3, 4, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.translation([2, 3, 4], dst);
    }, expected);
  });

  it('should translate', function() {
    var expected = [
      0,  1,  2,  3,
      4,  5,  6,  7,
      8,  9, 10, 11,
     12 + 0 * 2 + 4 * 3 + 8 * 4,
     13 + 1 * 2 + 5 * 3 + 9 * 4,
     14 + 2 * 2 + 6 * 3 + 10 * 4,
     15 + 3 * 2 + 7 * 3 + 11 * 4,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.translate(m, [2, 3, 4], dst);
    }, expected);
  });

  it('should make x rotation matrix', function() {
    var angle = 1.23;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var expected = [
      1, 0, 0, 0,
      0, c, s, 0,
      0,-s, c, 0,
      0, 0, 0, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.rotationX(angle, dst);
    }, expected);
  });

// TODO rotate x

  it('should make y rotation matrix', function() {
    var angle = 1.23;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var expected = [
      c, 0,-s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.rotationY(angle, dst);
    }, expected);
  });

// TODO rotate y

  it('should make z rotation matrix', function() {
    var angle = 1.23;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var expected = [
      c, s, 0, 0,
     -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.rotationZ(angle, dst);
    }, expected);
  });

// TODO rotate z
// TODO axisRotation
// TODO axisRotate

  it('should make scaling matrix', function() {
    var expected = [
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      0, 0, 0, 1,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.scaling([2, 3, 4], dst);
    }, expected);
  });

  it('should scale', function() {
    var expected = [
       0,  2,  4,  6,
      12, 15, 18, 21,
      32, 36, 40, 44,
      12, 13, 14, 15,
    ];
    testM4WithAndWithoutDest(function(dst) {
      return m4.scale(m, [2, 3, 4], dst);
    }, expected);
  });

// TODO transformPoint
// TODO transformDirectiojn
// TODO transformNormal

}

describe('m4', function() {

  it('should set default type', function() {
    m4.setDefaultType(Array);
    var d = m4.identity();
    d.should.be.Array();
    m4.setDefaultType(Float32Array);
    d = m4.identity();
    d.should.be.instanceOf(Float32Array);
  });

  describe('using Array', function() {
    m4.setDefaultType(Array);
    check();
  });

  describe('using Float32Array', function() {
    m4.setDefaultType(Float32Array);
    check();
  });

});

