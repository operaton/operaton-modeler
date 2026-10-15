import { getFormJSVersion } from '../formVersion';

describe('tabs/form/linting/util - formVersion', function() {

  describe('getFormJSVersion', function() {

    it('should return correct formJS version from version list', function() {

      [
        '1.0',
        '1.1',
        '2.0',
        '2.1'
      ].forEach((executionPlatformVersion) => {

        // given
        const schema = {
          executionPlatform: 'Operaton',
          executionPlatformVersion,
        };

        // when
        const version = getFormJSVersion(schema);

        // then
        expect(version).to.eql('1.14.0');
      });

    });

    it('should return null if provided platform is not found on the list', function() {

      // given
      const schema = {
        executionPlatform: 'Not Operaton',
        executionPlatformVersion: '2.0',
      };

      // when
      const version = getFormJSVersion(schema);

      // then
      expect(version).to.eql(null);

    });

  });

});
