var jspaths = ['src/js-dev/Util.js','src/js-dev/app.js', 'src/js-dev/classes/*.js', 'src/js-dev/main.js'];
var csspaths = ["src/sass/*.scss"];

var concatpaths = ['src/js/templates.js'].concat(jspaths);

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        banner: "(function(){\n\n",
        footer: "\n\n})();",
        separator: '\n\n'
      },
      dist: {
        src: concatpaths,
        dest: 'src/js/main.js'
      }
    },

    watch: {
      scripts:{
        files: jspaths,
        tasks: ['jshint','concat']
      }
    },

    uglify: {
      default: {
        options: {
          wrap: true
        },
        files: {
          'out/js/main.js': concatpaths
        }
      }
    },

    copy: {
      production: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['index.html','images/*','js/vendor/*'],
            dest: 'out/'
          }
        ]
      }
    },

    jshint:{
      default:{
        options: {
          curly: true,
          eqeqeq: true,
          immed: true,
          latedef: true,
          noarg: true,
          sub: true,
          undef: true,
          eqnull: true,
          browser: true,
          noempty: true,
          trailing: true,
          globals:{
              $: true,
              console:true,
              Handlebars:true,
              tpl:true,
              _:true,
              Backbone:true
          },
        },
        files:{
          src: jspaths
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint','concat','watch']);
  grunt.registerTask('production', ['jshint','uglify','copy:production']);

};