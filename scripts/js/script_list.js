(function() {
	var turdjs = window.turdjs,j="./scripts/js/",s="./scripts/css/",c=turdjs.allowCaching=true;
	turdjs.loadLibrary("jquery",c);
	turdjs.loadFile(s+"raidmanager.css",c);
	turdjs.importPackage("utils",c);
	turdjs.importPackage("logging",c);
	turdjs.importPackage("server",c);
	turdjs.importPackage("html",c);
	turdjs.loadFile(j+"main.js",c);
})();