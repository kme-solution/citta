export function eyeDoorProcess() {
  const phases = ["Past life-continuum", "Vibration", "Arrest", "Five-door adverting",
    "Eye-consciousness", "Receiving", "Investigating", "Determining",
    ...Array<string>(7).fill("Javana"), "Registration", "Registration"];
  return phases.map((phase, index) => ({ position: index + 1, phase }));
}
