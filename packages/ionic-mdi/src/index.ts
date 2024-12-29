import path, { join } from 'path';

import fs from 'fs-extra';
import pLimit from 'p-limit';

const formatIconName = (fileName: string, style: string) => {
  return `icon_${fileName.replace('.svg', '')}_${style}`.replace(
    /[_-](.)/g,
    (_, char) => char.toUpperCase()
  );
};

const processSvgFile = async (
  fileName: string,
  srcSvgDir: string,
  style: string
) => {
  const filePath = path.join(srcSvgDir, fileName);
  const svgContent = await fs.readFile(filePath, 'utf8');
  const preparedSvg = svgContent.replace(/"/g, "'");
  const iconName = formatIconName(fileName, style);

  return {
    esmIcons: `export const ${iconName} = \`data:image/svg+xml;utf8,${preparedSvg}\`;\n`,
    cjsIcons: `exports.${iconName} = \`data:image/svg+xml;utf8,${preparedSvg}\`;\n`,
    dtsIcons: `export declare var ${iconName}: string;\n`,
  };
};

const processSvgStyle = async (
  srcSvgDir: string,
  style: string,
  esmIconsPath: string,
  cjsIconsPath: string,
  dtsIconsPath: string
) => {
  const svgFiles = await fs.readdir(srcSvgDir);
  // Limit concurrent operations
  const limit = pLimit(10);

  const iconsData = await Promise.all(
    svgFiles.map((fileName) =>
      limit(() => processSvgFile(fileName, srcSvgDir, style))
    )
  );

  const esmIcons = iconsData.map((icon) => icon.esmIcons).join('');
  const cjsIcons = iconsData.map((icon) => icon.cjsIcons).join('');
  const dtsIcons = iconsData.map((icon) => icon.dtsIcons).join('');

  await Promise.all([
    fs.appendFile(esmIconsPath, esmIcons),
    fs.appendFile(cjsIconsPath, cjsIcons),
    fs.appendFile(dtsIconsPath, dtsIcons),
  ]);

  console.log(
    `Icons and TypeScript declarations generated for ${style}: ${svgFiles.length}`
  );
};

const processSvgDirectory = async (
  srcDir: string,
  esmIconsPath: string,
  cjsIconsPath: string,
  dtsIconsPath: string
) => {
  const iconStyles = await fs.readdir(srcDir, { withFileTypes: true });

  await Promise.all(
    iconStyles.map(async (dirent) => {
      if (dirent.isDirectory()) {
        const style = dirent.name;
        const srcSvgDir = path.join(srcDir, style);
        await processSvgStyle(
          srcSvgDir,
          style,
          esmIconsPath,
          cjsIconsPath,
          dtsIconsPath
        );
      }
    })
  );
};

const createPackageJson = async (distDir: string, packageJsonPath: string) => {
  const packageJsonData = await fs.readJson(packageJsonPath);
  const iconPackageJsonFilePath = join(distDir, 'package.json');
  const jsonStr = JSON.stringify(packageJsonData, null, 2) + '\n';
  await fs.writeFile(iconPackageJsonFilePath, jsonStr);
};

const clearDistDirectory = async (distDir: string) => {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(path.join(distDir, 'src'), { recursive: true });
};

const copyReadme = async (readmeFilePath: string, distDir: string) => {
  await fs.copy(readmeFilePath, path.join(distDir, 'README.md'));
};

const build = async () => {
  const rootDirectory = __dirname;
  const packageJsonFilePath = join(rootDirectory, '..', 'package.json');
  const readmeFilePath = join(rootDirectory, '..', 'README.md');
  const srcIconsDirectory = path.join(
    rootDirectory,
    '..',
    '..',
    '..',
    'node_modules',
    '@material-design-icons',
    'svg'
  );
  const distDirectory = path.join(
    rootDirectory,
    '..',
    '..',
    '..',
    'dist',
    'packages',
    'ionic-mdi'
  );
  const esmIconsPath = path.join(distDirectory, 'src', 'index.mjs');
  const cjsIconsPath = path.join(distDirectory, 'src', 'index.js');
  const dtsIconsPath = path.join(distDirectory, 'src', 'index.d.ts');

  try {
    await clearDistDirectory(distDirectory);

    await copyReadme(readmeFilePath, distDirectory);

    await createPackageJson(distDirectory, packageJsonFilePath);

    await processSvgDirectory(
      srcIconsDirectory,
      esmIconsPath,
      cjsIconsPath,
      dtsIconsPath
    );
  } catch (e) {
    console.error(e);
  }
};

build();
