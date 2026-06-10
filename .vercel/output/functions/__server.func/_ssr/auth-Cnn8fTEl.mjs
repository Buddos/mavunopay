import require$$0 from "crypto";
function hashPin(pin) {
  return require$$0.createHash("sha256").update(String(pin)).digest("hex");
}
export {
  hashPin as h
};
