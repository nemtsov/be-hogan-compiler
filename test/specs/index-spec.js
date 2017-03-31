const hoganCompiler = require('../../src');
const fsDriver = require('../../src/drivers/fs');

const FIXTURES_PATH = `${__dirname}/../fixtures`;

describe('be-hogan-compiler', function() {
  beforeEach(function() {
    this.driver = fsDriver;
    this.compiler = hoganCompiler.create(this.driver, FIXTURES_PATH);
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
    it('should add a lambda to the template', function(done) {
      const data = {
        i18n() {
          return (text) => {
            return /Hello/.test(text) ? 'Bonjour' : text;
          };
        },
      };

      this.compiler.compile('i18n')
      .then((template) => {
        expect(template.render(data)).toEqual('Bonjour, world!\n');
        done();
      }, done.fail);
    });
  });

  describe('isCached', function() {
    it('should not compile the same template more than once', function(done) {
      const fakeDriver = jasmine.createSpyObj('fsDriver', ['readFile']);
      fakeDriver.readFile.and.returnValue(Promise.resolve('fake_file'));

      const compiler = hoganCompiler.create(fakeDriver, '', { isCached: true });

      compiler.compile('a')
      .then(() => {
        compiler.compile('a')
        .then(() => {
          expect(fakeDriver.readFile.calls.count()).toEqual(1);
          done();
        });
      });
    });

    describe('populateCache', function() {
      it('should populate cache', function() {
        this.compiler = hoganCompiler.create(this.driver, FIXTURES_PATH, { isCached: true });

        return this.compiler.populateCache()
        .then(() => {
          spyOn(this.driver, 'readFile').and.callThrough();

          return Promise.all([
            this.compiler.compile('bNumA'),
            this.compiler.compile('partialParent'),
          ]);
        })
        .then(() => {
          expect(this.driver.readFile.calls.count()).toEqual(0);
        });
      });

      it('should return a ENOENT on a non-existant directory', function() {
        this.compiler = hoganCompiler.create(this.driver, `${FIXTURES_PATH}/__UNDEFINED__`, { isCached: true });
        return this.compiler.populateCache()
        .catch((err) => {
          if (!/ENOENT/.test(err.message)) {
            throw err;
          }
        });
      });
    });
  });

  it('should render a template with inheritance and deep lambdas', function(done) {
    const data = {
      i18n() {
        return (text) => {
          return /Hello/.test(text) ? 'Здравствуйте' : text;
        };
      },
    };

    this.compiler.compile('inheritance/parent')
    .then((template) => {
      expect(template.render(data))
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
