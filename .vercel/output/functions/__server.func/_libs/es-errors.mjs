import { g as getDefaultExportFromCjs } from "./lodash.mjs";
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  type = TypeError;
  return type;
}
var typeExports = /* @__PURE__ */ requireType();
const require$$1$2 = /* @__PURE__ */ getDefaultExportFromCjs(typeExports);
var esErrors;
var hasRequiredEsErrors;
function requireEsErrors() {
  if (hasRequiredEsErrors) return esErrors;
  hasRequiredEsErrors = 1;
  esErrors = Error;
  return esErrors;
}
var esErrorsExports = /* @__PURE__ */ requireEsErrors();
const require$$1$3 = /* @__PURE__ */ getDefaultExportFromCjs(esErrorsExports);
var _eval;
var hasRequired_eval;
function require_eval() {
  if (hasRequired_eval) return _eval;
  hasRequired_eval = 1;
  _eval = EvalError;
  return _eval;
}
var _evalExports = /* @__PURE__ */ require_eval();
const require$$2$1 = /* @__PURE__ */ getDefaultExportFromCjs(_evalExports);
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  range = RangeError;
  return range;
}
var rangeExports = /* @__PURE__ */ requireRange();
const require$$3 = /* @__PURE__ */ getDefaultExportFromCjs(rangeExports);
var ref;
var hasRequiredRef;
function requireRef() {
  if (hasRequiredRef) return ref;
  hasRequiredRef = 1;
  ref = ReferenceError;
  return ref;
}
var refExports = /* @__PURE__ */ requireRef();
const require$$4 = /* @__PURE__ */ getDefaultExportFromCjs(refExports);
var syntax;
var hasRequiredSyntax;
function requireSyntax() {
  if (hasRequiredSyntax) return syntax;
  hasRequiredSyntax = 1;
  syntax = SyntaxError;
  return syntax;
}
var syntaxExports = /* @__PURE__ */ requireSyntax();
const require$$5 = /* @__PURE__ */ getDefaultExportFromCjs(syntaxExports);
var uri;
var hasRequiredUri;
function requireUri() {
  if (hasRequiredUri) return uri;
  hasRequiredUri = 1;
  uri = URIError;
  return uri;
}
var uriExports = /* @__PURE__ */ requireUri();
const require$$7 = /* @__PURE__ */ getDefaultExportFromCjs(uriExports);
export {
  require$$5 as a,
  require$$7 as b,
  require$$4 as c,
  require$$3 as d,
  require$$2$1 as e,
  require$$1$3 as f,
  require$$1$2 as r
};
