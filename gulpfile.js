//首先通过以下声明的方法，把所有的插件都引用进来，然后就可以直接调用这些插件的方法
var gulp = require('gulp');
var rev = require('gulp-rev'); //给每一个文件计算出一个哈希码，然后把文件名修改掉
var revReplace = require('gulp-rev-replace'); //文件名改变了，但是index里的引用文件名还是原来的，这个插件用来把文件名改成新的
var useref = require('gulp-useref'); //可以在HTML里边，通过注释的方法写一些设置，比如把所有的CSS或js引用文件进行合并。代码：<!-- build:css css/combined.css --> (中间部分是引用的所有CSS或JS)<!-- endbuild -->
var filter = require('gulp-filter'); //过滤器，筛选出HTML、CSS、JS压缩后再扔（restore）回去。
var uglify = require('gulp-uglify'); //压缩JS代码的插件
var csso = require('gulp-csso'); //压缩CSS代码的插件

gulp.task('default', function () {
  //这个任务里首先声明了三个filter，然后在下面return，对文件流进行pipe处理
  var jsFilter = filter('**/*.js', {restore: true});
  var cssFilter = filter('**/*.css', {restore: true});
  var indexHtmlFilter = filter(['**/*', '!**/index.html'], {restore: true}); //‘**/*’代表所有文件，‘！**/index.html’，！代表排除，表示排除首页index。排除首页是为了保持首页文件名不变，因为首页index名变动可能会导致首页打开报错

  return gulp.src('src/index.html') //把要处理的文件拿过来
    .pipe(useref()) //分析index里边所有带注释标志的地方，把注释部分扔到处理流程（pipe）里，下一步进行filter处理
    .pipe(jsFilter) //这一个filter是把JS文件筛选出来，然后做一个下面的uglify（压缩）的操作
    .pipe(uglify()) //对上一步的JS文件进行压缩处理
    .pipe(jsFilter.restore) //这一步是把压缩后的文件通过restore再扔回到处理流程里。然后整个源代码的流接着往下进行。
    .pipe(cssFilter) //一下三个步骤是对CSS代码的处理，处理内容同JS一样
    .pipe(csso())
    .pipe(cssFilter.restore)
    .pipe(indexHtmlFilter) //这一步在上面变量声明中，进行了排除首页index操作
    .pipe(rev()) //然后这一步再生成哈希版本号为文件名
    .pipe(indexHtmlFilter.restore) //再进行恢复
    .pipe(revReplace()) //这一步是更新所有的引用文件名
    .pipe(gulp.dest('dist')); //最后一步，文件流要结束了，通过调用dest方法，把文件流扔到dist目录下
});

//最后在编辑器控制台中执行这个任务（比如：在webstorm的Terminal中输入：gulp default）,然后就可以在dist文件下看到压缩后的文件了
//gulp自动化只需要最后执行一个命令，整个打包的工作就完成了，非常方便。
