import { join } from 'path';

import fs from 'fs-extra';
import pLimit from 'p-limit';

export class IconBuilder {
  private static formatIconName = (fileName: string, style: string) => {
    return `icon_${fileName.replace('.svg', '')}_${style}`.replace(
      /[_-](.)/g,
      (_, char) => char.toUpperCase()
    );
  };

  private static processSvgFile = async (
    fileName: string,
    srcSvgDir: string,
    style: string
  ) => {
    const filePath = join(srcSvgDir, fileName);
    const svgContent = await fs.readFile(filePath, 'utf8');
    const preparedSvg = svgContent.replace(/"/g, "'");
    const iconName = IconBuilder.formatIconName(fileName, style);

    return {
      esmIcons: `export const ${iconName} = \`data:image/svg+xml;utf8,${preparedSvg}\`;\n`,
      cjsIcons: `exports.${iconName} = \`data:image/svg+xml;utf8,${preparedSvg}\`;\n`,
      dtsIcons: `export declare var ${iconName}: string;\n`,
    };
  };

  private static processSvgStyle = async (
    srcSvgDir: string,
    style: string,
    esmIconsPath: string,
    cjsIconsPath: string,
    dtsIconsPath: string
  ) => {
    const svgFiles = await fs.readdir(srcSvgDir);
    if (!Array.isArray(svgFiles) || !svgFiles.length) {
      return;
    }

    // Limit concurrent operations
    const limit = pLimit(10);

    const iconsData = await Promise.all(
      svgFiles.map((fileName) =>
        limit(() => IconBuilder.processSvgFile(fileName, srcSvgDir, style))
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

  private static processSvgDirectory = async (
    srcDir: string,
    esmIconsPath: string,
    cjsIconsPath: string,
    dtsIconsPath: string
  ) => {
    const iconStyles = await fs.readdir(srcDir, { withFileTypes: true });

    if (!Array.isArray(iconStyles) || !iconStyles.length) {
      return;
    }

    await Promise.all(
      iconStyles.map(async (dirent) => {
        if (dirent.isDirectory()) {
          const style = dirent.name;
          const srcSvgDir = join(srcDir, style);
          await IconBuilder.processSvgStyle(
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

  private static createPackageJson = async (
    distDir: string,
    packageJsonPath: string
  ) => {
    const packageJsonData = await fs.readJson(packageJsonPath);
    const iconPackageJsonFilePath = join(distDir, 'package.json');
    const jsonStr = JSON.stringify(packageJsonData, null, 2) + '\n';
    await fs.writeFile(iconPackageJsonFilePath, jsonStr);
  };

  private static clearDistDirectory = async (distDir: string) => {
    await fs.rm(distDir, { recursive: true, force: true });
  };

  public static build = async () => {
    const rootDirectory = __dirname;
    const packageJsonFilePath = join(rootDirectory, '..', 'package.json');
    const srcIconsDirectory = join(
      rootDirectory,
      '..',
      '..',
      '..',
      'node_modules',
      '@material-design-icons',
      'svg'
    );
    const distDirectory = join(
      rootDirectory,
      '..',
      '..',
      '..',
      'dist',
      'packages',
      'ionic-mdi'
    );
    const esmIconsPath = join(distDirectory, 'index.mjs');
    const cjsIconsPath = join(distDirectory, 'index.js');
    const dtsIconsPath = join(distDirectory, 'index.d.ts');

    try {
      await IconBuilder.clearDistDirectory(distDirectory);

      // Add readme
      await fs.copy(
        join(rootDirectory, '..', 'README.md'),
        join(distDirectory, 'README.md')
      );

      // Add license file
      await fs.copy(
        join(rootDirectory, '..', 'LICENSE'),
        join(distDirectory, 'LICENSE')
      );

      await IconBuilder.createPackageJson(distDirectory, packageJsonFilePath);

      await IconBuilder.processSvgDirectory(
        srcIconsDirectory,
        esmIconsPath,
        cjsIconsPath,
        dtsIconsPath
      );
    } catch (e) {
      console.error(e);
    }
  };
}

IconBuilder.build();
