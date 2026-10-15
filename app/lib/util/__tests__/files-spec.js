/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const {
  globJSON,
  globFiles,
  toPosixPath
} = require('../files');


describe('files', function() {

  describe('#globJSON', function() {

    it('should read given file name', function() {

      // when
      const { config } = globJSON('config.json', {
        searchPaths: [
          toAbsolutePath('files/bar')
        ]
      });

      // then
      expect(config).to.eql({ bar: 'BAR' });
    });


    it('should read given pattern', function() {

      // when
      const { config } = globJSON('**/config.json', {
        searchPaths: [
          toAbsolutePath('files')
        ]
      });

      // then
      expect(config).to.eql({
        foo: 'FOO',
        bar: 'FOO OVERRIDE'
      });
    });


    it('should consider defaults', function() {

      // when
      const { config } = globJSON('config.json', {
        searchPaths: [
          toAbsolutePath('files/bar')
        ],
        defaults: {
          foo: 'default FOO',
          bar: 'default BAR'
        }
      });

      // then
      expect(config).to.eql({
        foo: 'default FOO',
        bar: 'BAR'
      });
    });


    it('should handle errors gracefully', function() {

      // when
      const { config } = globJSON('**/*-json.json', {
        searchPaths: [
          toAbsolutePath('files')
        ]
      });

      // then
      expect(config).to.eql({
        good: 'JSON'
      });
    });

  });


  describe('#globFiles', function() {

    let directory;

    beforeEach(function() {
      directory = fs.mkdtempSync(path.join(os.tmpdir(), 'operaton-glob-'));
    });

    afterEach(function() {
      fs.rmSync(directory, { recursive: true, force: true });
    });

    it('should find files by pattern', function() {

      // when
      const files = globFiles('**/*-json.json', {
        searchPaths: [
          toAbsolutePath('files')
        ]
      });

      // then
      expect(files).to.eql([
        toAbsolutePath('files/bar/good-json.json'),
        toAbsolutePath('files/foo/not-json.json')
      ]);

    });


    it('should preserve configuration merge order', function() {

      const files = globFiles('**/config.json', {
        searchPaths: [ toAbsolutePath('files') ]
      });

      expect(files).to.eql([
        toAbsolutePath('files/bar/config.json'),
        toAbsolutePath('files/foo/config.json'),
        toAbsolutePath('files/foo/bar/config.json')
      ]);
    });


    it('should preserve search path precedence', function() {

      const { config, files } = globJSON('config.json', {
        searchPaths: [
          toAbsolutePath('files/foo/bar'),
          toAbsolutePath('files/bar')
        ]
      });

      expect(config).to.eql({ bar: 'BAR' });
      expect(files).to.eql([
        toAbsolutePath('files/foo/bar/config.json'),
        toAbsolutePath('files/bar/config.json')
      ]);
    });


    it('should support relative paths and directory inclusion', function() {

      const options = {
        cwd: toAbsolutePath('files'),
        absolute: false
      };

      expect(globFiles('*', options)).to.eql([]);
      expect(globFiles('*', { ...options, onlyFiles: false })).to.eql([
        'bar',
        'foo'
      ]);
    });


    it('should support dotfiles and ignored template paths', function() {

      fs.mkdirSync(path.join(directory, '.hidden'));
      fs.writeFileSync(path.join(directory, '.hidden', 'template.json'), '{}');
      fs.writeFileSync(path.join(directory, 'visible.json'), '{}');

      const options = { cwd: directory, absolute: false };

      expect(globFiles('**/*.json', options)).to.eql([ 'visible.json' ]);
      expect(globFiles('**/*.json', { ...options, dot: true })).to.eql([
        'visible.json',
        '.hidden/template.json'
      ]);
      expect(globFiles('**/*.json', {
        ...options,
        dot: true,
        ignore: [ toPosixPath(path.join(directory, '.hidden', '**')) ]
      })).to.eql([ 'visible.json' ]);
    });


    it('should match template extensions case-sensitively on every platform', function() {

      fs.writeFileSync(path.join(directory, 'lower.json'), '{}');
      fs.writeFileSync(path.join(directory, 'upper.JSON'), '{}');

      expect(globFiles('*.json', { cwd: directory, absolute: false })).to.eql([
        'lower.json'
      ]);
    });


    it('should follow linked template directories', function() {

      fs.mkdirSync(path.join(directory, 'original'));
      fs.writeFileSync(path.join(directory, 'original', 'template.json'), '{}');
      fs.symlinkSync(path.join(directory, 'original'), path.join(directory, 'linked'), 'junction');

      expect(globFiles('**/*.json', { cwd: directory, absolute: false })).to.eql([
        'linked/template.json',
        'original/template.json'
      ]);
    });

  });

});


function toAbsolutePath(file) {
  return toPosixPath(path.resolve(__dirname, file));
}
