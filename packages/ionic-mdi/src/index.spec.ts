import path from 'path';

import fs from 'fs-extra';

import { IconBuilder } from './index';

jest.mock('fs-extra');

const mockedReadFile = jest.mocked(fs.readFile);
const mockedRm = jest.mocked(fs.rm);
const mockedAppendFile = jest.mocked(fs.appendFile);
const mockedReaddir = jest.mocked(fs.readdir);
const mockedCopy = jest.mocked(fs.copy);

describe('SVG processing tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatIconName', () => {
    it('should format icon name correctly', () => {
      const result = IconBuilder['formatIconName']('test-icon.svg', 'style1');
      expect(result).toBe('iconTestIconStyle1');
    });

    it('should handle file names with multiple dashes and underscores', () => {
      const result = IconBuilder['formatIconName'](
        'test-icon_name.svg',
        'style2'
      );
      expect(result).toBe('iconTestIconNameStyle2');
    });
  });

  describe('processSvgFile', () => {
    it('should correctly process a single SVG file', async () => {
      (mockedReadFile as jest.Mock).mockResolvedValue('<svg>test</svg>');

      const result = await IconBuilder['processSvgFile'](
        'test.svg',
        '/mock/src/dir',
        'style1'
      );

      expect(mockedReadFile).toHaveBeenCalledWith(
        path.join('/mock/src/dir', 'test.svg'),
        'utf8'
      );
      expect(result.esmIcons).toContain(
        'data:image/svg+xml;utf8,<svg>test</svg>'
      );
      expect(result.cjsIcons).toContain(
        'data:image/svg+xml;utf8,<svg>test</svg>'
      );
      expect(result.dtsIcons).toContain(
        'export declare var iconTestStyle1: string;'
      );
    });

    it('should handle errors during file processing', async () => {
      (mockedReadFile as jest.Mock).mockRejectedValue(
        new Error('File not found')
      );

      await expect(
        IconBuilder['processSvgFile']('missing.svg', '/mock/src/dir', 'style1')
      ).rejects.toThrow('File not found');
    });
  });

  describe('clearDistDirectory', () => {
    it('should clear the dist directory', async () => {
      (mockedRm as jest.Mock).mockResolvedValue(() => undefined);

      await IconBuilder['clearDistDirectory']('/mock/dist/dir');

      expect(mockedRm).toHaveBeenCalledWith('/mock/dist/dir', {
        recursive: true,
        force: true,
      });
    });

    it('should handle errors during directory deletion', async () => {
      (mockedRm as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(
        IconBuilder['clearDistDirectory']('/mock/dist/dir')
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('processSvgStyle', () => {
    it('should process SVG files for a given style', async () => {
      (mockedReadFile as jest.Mock).mockResolvedValue('<svg>test</svg>');
      (mockedReaddir as jest.Mock).mockResolvedValue([
        'icon1.svg',
        'icon2.svg',
      ]);
      (mockedAppendFile as jest.Mock).mockResolvedValue(undefined);

      await IconBuilder['processSvgStyle'](
        '/mock/src/svg/style1',
        'style1',
        '/mock/esm/path',
        '/mock/cjs/path',
        '/mock/dts/path'
      );

      expect(mockedReaddir).toHaveBeenCalledWith('/mock/src/svg/style1');
      expect(mockedAppendFile).toHaveBeenCalledTimes(3); // esm, cjs, dts
      expect(mockedAppendFile).toHaveBeenNthCalledWith(
        1,
        '/mock/esm/path',
        expect.stringContaining('iconIcon1Style1')
      );
      expect(mockedAppendFile).toHaveBeenNthCalledWith(
        2,
        '/mock/cjs/path',
        expect.stringContaining('iconIcon1Style1')
      );
      expect(mockedAppendFile).toHaveBeenNthCalledWith(
        3,
        '/mock/dts/path',
        expect.stringContaining('iconIcon1Style1')
      );
    });

    it('should handle an empty SVG directory gracefully', async () => {
      (mockedReaddir as jest.Mock).mockResolvedValue([]);

      await IconBuilder['processSvgStyle'](
        '/mock/src/svg/style1',
        'style1',
        '/mock/esm/path',
        '/mock/cjs/path',
        '/mock/dts/path'
      );

      expect(mockedReaddir).toHaveBeenCalledWith('/mock/src/svg/style1');
      expect(mockedAppendFile).not.toHaveBeenCalled();
    });
  });

  describe('build', () => {
    it('should build the icons package correctly', async () => {
      const clearDistDirectorySpy = jest.spyOn(
        IconBuilder,
        'clearDistDirectory' as any
      );
      const createPackageJsonSpy = jest.spyOn(
        IconBuilder,
        'createPackageJson' as any
      );
      const processSvgDirectorySpy = jest.spyOn(
        IconBuilder,
        'processSvgDirectory' as any
      );

      (mockedCopy as jest.Mock).mockResolvedValue(undefined);
      clearDistDirectorySpy.mockResolvedValue(undefined);
      createPackageJsonSpy.mockResolvedValue(undefined);
      processSvgDirectorySpy.mockResolvedValue(undefined);

      await IconBuilder.build();

      expect(clearDistDirectorySpy).toHaveBeenCalled();
      expect(createPackageJsonSpy).toHaveBeenCalled();
      expect(processSvgDirectorySpy).toHaveBeenCalled();
      expect(mockedCopy).toHaveBeenCalledTimes(4); // README.md, CHANGELOG.md, LICENSE, and docs
    });
  });
});
