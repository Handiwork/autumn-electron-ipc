/* eslint-disable quotes */
import { readFile, writeFile, copyFile } from "fs/promises";

async function writePackageInfo() {
  const packageInfo = JSON.parse(
    await readFile("./package.json", { encoding: "utf-8" })
  );
  const {
    name,
    version,
    description,
    keywords,
    author,
    license,
    repository,
    homepage,
    publishConfig,
    dependencies,
    peerDependencies,
  } = packageInfo;

  const indexDtsName = "index.d.ts";
  const preloadDtsName = "preload.d.ts";
  const rendererDtsName = "renderer.d.ts";

  const info = {
    name,
    version,
    description,
    keywords,
    author,
    license,
    repository,
    homepage,
    publishConfig,
    dependencies,
    peerDependencies,
    main: "cjs/index.js",
    types: "index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        import: "./esm/main.js",
        require: "./cjs/main.js",
      },
      "./preload": {
        types: "./preload.d.ts",
        import: "./esm/preload.js",
        require: "./cjs/preload.js",
      },
      "./renderer": {
        types: "./renderer.d.ts",
        import: "./esm/renderer.js",
        require: "./cjs/renderer.js",
      },
    },
    files: [
      "cjs",
      "esm",
      "types",
      indexDtsName,
      preloadDtsName,
      rendererDtsName,
    ],
  };

  await writeFile("dist/package.json", JSON.stringify(info, null, 2), {
    encoding: "utf-8",
  });
  await writeFile(`dist/${indexDtsName}`, `export * from "./types/main";`, {
    encoding: "utf-8",
  });
  await writeFile(
    `dist/${preloadDtsName}`,
    `export * from "./types/preload";`,
    {
      encoding: "utf-8",
    }
  );
  await writeFile(
    `dist/${rendererDtsName}`,
    `export * from "./types/renderer";`,
    {
      encoding: "utf-8",
    }
  );
  await copyFile("readme.md", "dist/readme.md");
}

writePackageInfo();
