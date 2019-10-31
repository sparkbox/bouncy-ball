"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// slightly modified code from the Vanilla.js example
var getPosition = function getPosition(elapsedTime, h, k) {
  var a = 4 * k / Math.pow(h * 2, 2); // coefficient: -.000483932
  // Position as a function of time, using the vertex form
  // of the quadratic formula:  f(x) = a(x - h)^2 + k,
  // (where [h, k] is the vertex). See it graphically at:
  //    https://www.desmos.com/calculator/i6yunccp7v

  var ypos = a * Math.pow((elapsedTime + h) % (h * 2) - h, 2);
  return ypos;
}; // default ball style, CSS in JS


var style = {
  display: 'block',
  position: 'absolute',
  width: 50,
  height: 50,
  borderRadius: '50%',
  backgroundColor: '#00CFFF'
}; // renders a Ball at a certain height

var Ball = function Ball(_ref) {
  var y = _ref.y;
  return React.createElement("div", {
    style: _objectSpread({}, style, {
      top: y
    })
  });
}; // performs a Quadratic Ease in and Ease out repeatedly


var QuadBounce =
/*#__PURE__*/
function (_React$Component) {
  _inherits(QuadBounce, _React$Component);

  function QuadBounce() {
    var _getPrototypeOf2;

    var _temp, _this;

    _classCallCheck(this, QuadBounce);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(_this, (_temp = _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(QuadBounce)).call.apply(_getPrototypeOf2, [this].concat(args))), _this.state = {
      beginning: Date.now()
    }, _this.updateValue = function () {
      var _assertThisInitialize = _assertThisInitialized(_this),
          _assertThisInitialize2 = _assertThisInitialize.props,
          duration = _assertThisInitialize2.duration,
          start = _assertThisInitialize2.start,
          end = _assertThisInitialize2.end,
          beginning = _assertThisInitialize.state.beginning;

      var time = Date.now() - beginning;
      var value = start + getPosition(time, duration / 2, end - start);

      _this.setState({
        value: value
      });
    }, _temp));
  }

  _createClass(QuadBounce, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.setState({
        interval: setInterval(this.updateValue, 20)
      });
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      clearInterval(this.state.interval);
    }
  }, {
    key: "render",
    value: function render() {
      var renderedChildren = this.props.children(this.state.value);
      return renderedChildren && React.Children.only(renderedChildren);
    }
  }]);

  return QuadBounce;
}(React.Component);

ReactDOM.render(React.createElement(QuadBounce, {
  duration: 1150,
  start: 0,
  end: 160
}, function (value) {
  return React.createElement(Ball, {
    y: value
  });
}), document.getElementById('root'));
