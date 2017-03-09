const hoganCompiler = require('../../src');
const fsReadFile = require('../../src/drivers/fs');

const FIXTURES_PATH = `${__dirname}/../fixtures`;

describe('be-hogan-compiler', function() {
  beforeEach(function() {
    this.compiler = hoganCompiler.create(fsReadFile, FIXTURES_PATH);
  });

  it('should compile and render a template', function(done) {
    this.compiler.compile('bNumA')
    .then((template) => {
      expect(template.render({ num: '42' })).toEqual('b 42 a\n');
      done();
    }, done.fail);
  });

  it('should render a template with partials', function(done) {
    this.compiler.compile('partialParent')
    .then((template) => {
      expect(template.render({ num: '35' }))
      .toEqual('parent( child( grandChild( 35 )\n )\n )\n');
      done();
    }, done.fail);
  });

  it('should compile on recursive partials', function(done) {
    this.compiler.compile('recursive')
    .then(done, done.fail);
  });

  describe('addLambda', function() {
    it('should add a lambda to the tempalte', function(done) {
      this.compiler.addLambda('i18n', () => {
        return (text) => {
          return /Hello/.test(text) ? 'Bonjour' : text;
        };
      });

      this.compiler.compile('i18n')
      .then((template) => {
        expect(template.render()).toEqual('Bonjour, world!\n');
        done();
      }, done.fail);
    });
  });

  describe('isCached', function() {
    it('should not compile the same template more than once', function(done) {
      const fakeReadFile = jasmine.createSpy('readFile')
      .and.returnValue(Promise.resolve('fake_file'));

      const compiler = hoganCompiler.create(fakeReadFile, '', { isCached: true });

      compiler.compile('a')
      .then(() => {
        compiler.compile('a')
        .then(() => {
          expect(fakeReadFile.calls.count()).toEqual(1);
          done();
        });
      });
    });
  });

  it('should render a template with inheritance and deep lambdas', function(done) {
    this.compiler.addLambda('i18n', () => {
      return (text) => {
        return /Hello/.test(text) ? 'Здравствуйте' : text;
      };
    });

    this.compiler.compile('inheritance/parent')
    .then((template) => {
      expect(template.render())
      .toEqual([
        '<parent>',
        '<child id="83">',
        '<grandChild>a Здравствуйте</grandChild>',
        '',
        '<grandChild>b Здравствуйте</grandChild>',
        '</child>',
        '</parent>',
        '',
      ].join('\n'));
      done();
    }, done.fail);
  });
});
