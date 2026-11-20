export function interpretSpeech(text: string) {
  const command = /^(remember|read)\s+([\s\S]+)$/i.exec(text);
  if (command) {
    const verb = command[1].toLowerCase();
    return { action: verb, body: command[2], reason: "Matched the explicit " + verb + " command." };
  }
  if (/^recall[.!?]?$/i.test(text)) return { action:"recall", body:"", reason:"Requested the latest saved note." };
  return { action:"help", body:"", reason:"No supported command matched." };
}
