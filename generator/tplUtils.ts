export function parseTplSetName(tplSetName: string) {
  const slugMarker = tplSetName.indexOf("--");
  const slug = slugMarker >= 0 ? tplSetName.substring(slugMarker + 2) : "";
  const splitted = tplSetName.replace(slug, "").split("-");

  let library = splitted.shift;
  let language = null;
  let importStyle = null;
  let buildTarget = null;
  let moduleType = null;

  for (let i = 0; i < splitted.length; i++) {
    const head = splitted[i];
    switch (head) {
      case "lang": {
        language = splitted[++i];
        break;
      }
      case "style": {
        importStyle = splitted[++i];
        break;
      }
      case "target": {
        buildTarget = splitted[++i];
        break;
      }
      case "type": {
        moduleType = splitted[++i];
        break;
      }
    }
  }

  return {
    library,
    language,
    importStyle,
    buildTarget,
    moduleType,
    slug,
  };
}
