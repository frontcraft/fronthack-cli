"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.object.define-property");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("regenerator-runtime/runtime");

var afs = _interopRequireWildcard(require("async-file"));

var _case = _interopRequireDefault(require("case"));

var _cliHighlight = require("cli-highlight");

var _getFronthackPath = _interopRequireDefault(require("../helpers/getFronthackPath"));

var _output = _interopRequireDefault(require("../helpers/output"));

var _addImportToApp = _interopRequireDefault(require("./addImportToApp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Generate blank Sass component from template.
 * @argument {string} projectSrc path to the src directory of current project
 * @argument {string} type can be 'component' or 'global'
 * @argument {string} machinename unique name identifier of the component
 * @argument {string} description optional description of the component
 */
var _default =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(projectSrc, type, machinename) {
    var description,
        fronthackPath,
        sassContent,
        humanCase,
        parsedSassContent,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            description = _args.length > 3 && _args[3] !== undefined ? _args[3] : null;
            _context.next = 3;
            return (0, _getFronthackPath["default"])();

          case 3:
            fronthackPath = _context.sent;
            _context.next = 6;
            return afs.readFile("".concat(fronthackPath, "/templates/sass-component.sass"), 'utf8');

          case 6:
            sassContent = _context.sent;
            humanCase = _case["default"].sentence(machinename);
            parsedSassContent = sassContent.replace('Name', humanCase).replace(/name/g, machinename);
            if (description) parsedSassContent = parsedSassContent.replace('Description', description);
            _context.next = 12;
            return afs.writeFile("".concat(projectSrc, "/sass/").concat(type, "s/_").concat(machinename, ".sass"), parsedSassContent);

          case 12:
            _context.next = 14;
            return (0, _addImportToApp["default"])(projectSrc, type, machinename);

          case 14:
            (0, _output["default"])('\n--------------------------------------------------\n');
            (0, _output["default"])("New element can have folowing initial HTML markup:\n");
            console.log((0, _cliHighlight.highlight)("<div class=\"".concat(machinename, "\"></div>"), {
              language: 'html'
            }));
            (0, _output["default"])('\n--------------------------------------------------\n');

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;