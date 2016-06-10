var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('toEs5', function () {
  return gulp.src("public/js/*.js")
    .pipe(babel())
    .pipe(gulp.dest("public/js-compile"));
});

gulp.task('auto', function () {
  gulp.watch('public/js/*.js', ['toEs5']);
});

gulp.task('default', ['toEs5', 'auto']);