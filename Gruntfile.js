module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		open: {
			dev: {
				path: 'http://localhost:8000'
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: './www'
				}
			}
		},
		watch: {
			scripts: {
				files: ['www/scripts/**/*.js', '!www/scripts/lib/*.js', '!www/scripts/require.js'],
				tasks: ['jshint:scripts'],
				options: {
					livereload: true
				}
			},
			css: {
				files: ['www/css/**/*.css'],
				options: {
					livereload: true
				}
			},
			html: {
				files: ['www/**/*.html'],
				options: {
					livereload: true
				}
			},
			gruntfile: {
				files: ['gruntfile.js'],
				tasks: ['jshint:gruntfile']
			}
		},
		jshint: {
			scripts: ['<%= watch.scripts.files %>'],
			gruntfile: ['<%= watch.gruntfile.files %>']
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('server', ['connect', 'open:dev', 'watch']);
};