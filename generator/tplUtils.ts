export function parseTplSetName(tplSetName: string) {
  const slugMarker = tplSetName.indexOf("--");
  const slug = slugMarker >= 0 ? tplSetName.substring(slugMarker + 2) : "";
  const splitted = tplSetName.replace(slug, "").split("-");

  let library = splitted.shift;
  let language: string | null = null;
  let importStyle: string | null = null;
  let buildTarget: string | null = null;
  let moduleType: string | null = null;

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
    buildTarget: {
      value: buildTarget,
      get tsModule() {
        if (buildTarget === "cjs") return "CommonJS";
        if (buildTarget === "esm") return "NodeNext";
        thrower(`unknown build target: ${buildTarget}`);
      },
      get moduleType() {
        if (buildTarget === "cjs") return "commonjs";
        if (buildTarget === "esm") return "module";
        thrower(`unknown build target: ${buildTarget}`);
      },
    },
    moduleType,
    slug,
  };
}

function thrower(message: string): never {
  throw new Error(message);
}
