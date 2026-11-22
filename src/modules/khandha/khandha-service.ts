export function eyeDoorKhandha(object: 'prior' | 'visible', seeing: boolean) {
  return {
    rupa:
      object === 'visible' ? 'Visible form is the object' : 'Presenting form is material context',
    vedana: seeing ? 'Neutral' : 'Present; tone unspecified',
    sanna: "Marks the object's features",
    sankhara: 'Associated formations, including volition',
    vinnana: object === 'visible' ? 'Cognizes visible form' : 'Cognizes prior bhavanga object',
  };
}
