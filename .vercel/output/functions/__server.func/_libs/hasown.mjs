import { g as getDefaultExportFromCjs } from "./lodash.mjs";
import { r as requireFunctionBind } from "./function-bind.mjs";
var hasown;
var hasRequiredHasown;
function requireHasown() {
  if (hasRequiredHasown) return hasown;
  hasRequiredHasown = 1;
  var call = Function.prototype.call;
  var $hasOwn = Object.prototype.hasOwnProperty;
  var bind = requireFunctionBind();
  hasown = bind.call(call, $hasOwn);
  return hasown;
}
var hasownExports = /* @__PURE__ */ requireHasown();
const require$$24 = /* @__PURE__ */ getDefaultExportFromCjs(hasownExports);
export {
  require$$24 as r
};
