function validateUnion<const T extends string>(
  given: string,
  candidates: readonly T[]
): T {
  if (!candidates.includes(given as T)) {
    thrower(`given: ${given} is not in candidates: ${candidates}`);
  }
  return given as T;
}

const languageCandidates = ["js", "ts"] as const;
const importStyleCandidates = ["require", "import"] as const;
const buildTargetCandidates = ["cjs", "esm"] as const;
const moduleTypeCandidates = ["commonjs", "module"] as const;

export function parseTplSetName(tplSetName: string) {
  const slugMarker = tplSetName.indexOf("--");
  const slug = slugMarker >= 0 ? tplSetName.substring(slugMarker + 2) : "";
  const splitted = tplSetName.replace(slug, "").split("-");

  let library = splitted.shift;
  let language: (typeof languageCandidates)[number] | null = null;
  let importStyle: (typeof importStyleCandidates)[number] | null = null;
  let buildTarget: (typeof buildTargetCandidates)[number] | null = null;
  let moduleType: (typeof moduleTypeCandidates)[number] | null = null;

  for (let i = 0; i < splitted.length; i++) {
    const head = splitted[i];
    switch (head) {
      case "lang": {
        language = validateUnion(splitted[++i], languageCandidates);
        break;
      }
      case "style": {
        importStyle = validateUnion(splitted[++i], importStyleCandidates);
        break;
      }
      case "target": {
        buildTarget = validateUnion(splitted[++i], buildTargetCandidates);
        break;
      }
      case "type": {
        moduleType = validateUnion(splitted[++i], moduleTypeCandidates);
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
      get swcModule() {
        if (buildTarget === "cjs") return "commonjs";
        if (buildTarget === "esm") return "es6";
        thrower(`unknown build target: ${buildTarget}`);
      },
      get outputFormat() {
        if (buildTarget === "cjs") return "cjs";
        if (buildTarget === "esm") return "esm";
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
