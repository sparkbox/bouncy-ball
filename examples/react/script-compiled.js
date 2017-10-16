'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// slightly modified code from the Vanilla.js example
var getPosition = function getPosition(elapsedTime, h, k) {
  var a = 4 * k / Math.pow(h * 2, 2); // coefficient: -.000483932

  // Position as a function of time, using the vertex form
  // of the quadratic formula:  f(x) = a(x - h)^2 + k,
  // (where [h, k] is the vertex). See it graphically at:
  //    https://www.desmos.com/calculator/i6yunccp7v
  var ypos = a * Math.pow((elapsedTime + h) % (h * 2) - h, 2);

  return ypos;
};

// default ball style, CSS in JS
var style = {
  display: 'block',
  position: 'absolute',
  width: 50,
  height: 50,
  borderRadius: '50%',
  backgroundColor: '#00CFFF'
};

// renders a Ball at a certain height
var Ball = function Ball(_ref) {
  var y = _ref.y;
  return React.createElement('div', {
    style: _extends({}, style, {
      top: y
    })
  });
};

// performs a Quadratic Ease in and Ease out repeatedly

var QuadBounce = function (_React$Component) {
  _inherits(QuadBounce, _React$Component);

  function QuadBounce() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, QuadBounce);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = QuadBounce.__proto__ || Object.getPrototypeOf(QuadBounce)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
      beginning: Date.now()
    }, _this.updateValue = function () {
      var _this2 = _this;
      var _this2$props = _this2.props;
      var duration = _this2$props.duration;
      var start = _this2$props.start;
      var end = _this2$props.end;
      var beginning = _this2.state.beginning;


      var time = Date.now() - beginning;
      var value = start + getPosition(time, duration / 2, end - start);
      _this.setState({ value: value });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(QuadBounce, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({ interval: setInterval(this.updateValue, 0) });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this.state.interval);
    }
  }, {
    key: 'render',
    value: function render() {
      var renderedChildren = this.props.children(this.state.value);
      return renderedChildren && React.Children.only(renderedChildren);
    }
  }]);

  return QuadBounce;
}(React.Component);

ReactDOM.render(React.createElement(
  QuadBounce,
  {
    duration: 1150,
    start: 0,
    end: 160
  },
  function (value) {
    return React.createElement(Ball, { y: value });
  }
), document.getElementById('root'));
