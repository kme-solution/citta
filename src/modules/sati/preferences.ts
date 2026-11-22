export const preferenceValues:Record<string,readonly string[]>={
 'response-language':['en','my'],
 'response-length':['concise','detailed'],
 'explanation-style':['plain','technical']
};
export function validPreference(key:string,value:string) {
  return Object.hasOwn(preferenceValues,key)&&preferenceValues[key].includes(value);
}
