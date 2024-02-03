<?php	
	@header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	@header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	@header("Cache-Control: no-store, no-cache, must-revalidate");
	@header("Cache-Control: post-check=0, pre-check=0", false);
	@header("Pragma: no-cache");
	@header("Access-Control-Allow-Origin: *");
				
	$debugOutput = false;

	function d($str) {
		echo "".$str."</br>";
		
	}
	
	function getProtocol() {
		$protocol = null;
		if (	isset($_SERVER['HTTPS']) &&
			($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) ||
			isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
			$_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
			$protocol = 'https://';
		} else {
			$protocol = 'http://';
		}
		return $protocol;
	}
	
	function getIp() {
		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			$ip = $_SERVER['HTTP_CLIENT_IP'];
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		} else {
			$ip = $_SERVER['REMOTE_ADDR'];
		}
		return $ip;
	}
	
	function checkModificationDate($dir, $lastTime){
		$ffs = scandir($dir);
		$i = 0;
		foreach ( $ffs as $ff ){
			if ( $ff != '.' && $ff != '..' ){
				if ( strlen($ff)>=5 ) {
					if ( substr($ff, -4)) {
						$list[] = $ff;
						//echo dirname($ff) . $ff . "<br/>";
						$path = $dir.'/'.$ff;
						$fileDate= date("F d Y H:i:s.",   filemtime($path));
						$time = (int)(strtotime($fileDate));
						//echo $path."Last modified: ".$time."<br/>";						
						if(str_contains($path, "css_cache_") || str_contains($path, "js_cache_") || str_contains($path, "time_cache.txt")) {
							//echo "skip file: \"".$path."\"<br/>";
						} else {						
							if($time > $lastTime) {					
								$lastTime = $time;
								//echo "newer file: ".$path."Last modified: ".$time."<br/>"; 
								//echo $time."<br/>";
							}
						}
					}   
				}       
				if( is_dir($dir.'/'.$ff) ) 
					$lastTime = checkModificationDate($dir.'/'.$ff, $lastTime);
			}
		}
		return $lastTime;
	}
	
	function getFilePath($dir, $fileName){
		$ffs = scandir($dir);
		$i = 0;
		foreach ( $ffs as $ff ){
			if ( $ff != '.' && $ff != '..' ){
				if ( strlen($ff)>=5 ) {
					if ( substr($ff, -4)) {
						$list[] = $ff;
						//echo dirname($ff) . $ff . "<br/>";
						$path = $dir.'/'.$ff;
						if((str_contains($path, $fileName) && $fileName != "") ||  $fileName == $ff) {
							//echo "found inner: ".$path." fileName: ".$fileName."</br>";
							return $path;
						}
					}   
				}      
				$result = null;
				if( is_dir($dir.'/'.$ff) ) 
					$result = getFilePath($dir.'/'.$ff, $fileName);
				if($result != null) {
					//echo "found within loop: ".$result." fileName: ".$fileName."</br>";
					return $result;
				}
			}
		}
		return null;
	}
	
	function getDirContents($dir){
		$results = array();
		$files = scandir($dir);
		foreach($files as $key => $value){
			if(!is_dir($dir. DIRECTORY_SEPARATOR .$value)){
				$results[] = $value;
			} else if(is_dir($dir. DIRECTORY_SEPARATOR .$value)) {
				$results[] = $value;
				getDirContents($dir. DIRECTORY_SEPARATOR .$value);
			}
		}
	}
	
	function readLines($textFilePath) {	
		$lines = array();
		$handle = @fopen($textFilePath, "r");
		if ($handle) {
			while (($buffer = fgets($handle, 4096)) !== false) {
				$lines[] = $buffer;
			}
			if (!feof($handle)) {
				//echo "Error: unexpected fgets() fail</br>";
			}
			fclose($handle);
		}		
		//echo "read #".count($lines)."</br>";
		return $lines;
	}
	
	function extractPart($line, $start, $end) {
		$result = null;
		$dstart = strpos($line, $start);		
		if($dstart !== false) {
			$dend = strpos($line, $end);
			$result = substr($line, $dstart+strlen($start),  ($dend-($dstart+strlen($start))));
		}
		return $result;
	}
	
	function getCacheFiles($dir){
		$results = array();
		$files = scandir($dir);
		foreach($files as $key => $value){
			if(!is_dir($dir. DIRECTORY_SEPARATOR .$value)){
				if(str_contains($value, "_cache_")) {
					$results[] = $value;
				}
			}
		}
		return $results;
	}
	
	$createCache = false;
	/*
	if(isset($_GET["update"])) {
		$timeStamp = checkModificationDate(dirname(__FILE__), 0);
		//echo "check files last modification: ".$timeStamp."</br>";		
	} else {
		//echo "up to date</br>";
	}
	*/
	
	$timeStamp = checkModificationDate(dirname(__FILE__), 0);
	
	
	$filePath = dirname(__FILE__)."/scripts/";
	$compareTime = intval(file_get_contents($filePath."/time_cache.txt"));
	
	//echo "compareTime: \"".$compareTime."\"";
	
	if($compareTime < $timeStamp) {
		$createCache = true;
		$files = getCacheFiles($filePath);
		//echo "count files: \"".count($files)."\"";
		for($i = 0; $i < count($files); $i++) {
			unlink($filePath."/".$files[$i]);
		}	
	}
	
	$siteCss = null;
	$siteJs = null;
	
	if($createCache) {
	
		$filePath= substr(__FILE__, 0, strlen(__FILE__) - strlen("index.php"));
		//echo "filePath: ".$filePath."</br>";
	
		$appFile = getFilePath(dirname(__FILE__), "app.html");
		//echo "appFile: ".$appFile."</br>";
	
		$scriptFile = getFilePath(dirname(__FILE__), "script_list.js");
		$scriptPath = dirname($scriptFile);
		//echo "scriptPath: ".$scriptFile."</br>";
	
	
		//echo "scriptIP: ".getProtocol().getIp()."</br>";
	
		$turdDistribution = null;
		$turdVersion = null;
	
		if($appFile != null) {
			$appLines = readLines($appFile);
			for($i = 0; $i < count($appLines); $i++) {
				$line = $appLines[$i];			
				$temp = extractPart($line, "turdjs.distribution=\"", "\";");			
				if($temp != null) {
					//echo "temp: ".$temp."</br>";
					$turdDistribution = $temp;
				}
				$temp =  extractPart($line, "turdjs.version=\"", "\";");
				if($temp != null) {
					//echo "temp: ".$temp."</br>";
					$turdVersion = $temp;
				}
			}
		}
	
		$hostName = getIp();
		$isLocal  = false;
		$localIP = "192.xxx.xx.xxx"
		if(str_contains($hostName, $localIP) || str_contains($hostName, "localhost") || str_contains($hostName, "127.0.0.1")) {
			$isLocal = true;
		}
	
		if($isLocal) {
			$turdUrl = getProtocol().getIp()."/turdjs/".$turdDistribution."/".$turdVersion."/";
		} else {
			$turdUrl = "https://turdjs.leechlabs.org/".$turdDistribution."/".$turdVersion."/";
		}
		//echo "turdUrl: ".$turdUrl."</br>";
	
		$cacheScripts = true;
		$jsFolder = "";
		$cssFolder = "";
		$siteCss = "";
		$siteJs = "";
		$siteJs .= file_get_contents($turdUrl."turd.js");
	
		$siteDir = dirname(__FILE__);
		
		if($scriptFile != null) {
			$scriptLines = readLines($scriptFile);		
		
			for($i = 0; $i < count($scriptLines); $i++) {		
				$line = $scriptLines[$i];
				if(str_contains($line, "var turdjs = window.turdjs")) {
					//echo "line: ".$line."</br>";
					$jsFolder = extractPart($line, "j=\"", "\",s");
					$cssFolder =  extractPart($line, "s=\"", "\",c");
					$allowCaching = extractPart($line, "c=turdjs.allowCaching=", ";");
					//echo "jsFolder: \"".$jsFolder."\" cssFolder: \"".$cssFolder."\" caching: \"".$allowCaching."\"</br>";
					if($allowCaching == "false") {
						$cacheScripts = false;
						break;
					}
				}
				if(str_contains($line, "turdjs.loadLibrary(")) {
					$libraryName =  extractPart($line, "turdjs.loadLibrary(\"", "\",c");
					//d("libraryName: \"".$libraryName."\"");
					$libaryLoc = $turdUrl."lib/".$libraryName.".js";
				
					//d("lib loc: \"".$libaryLoc."\"");
				
					$libraryLines = readLines($turdUrl."lib/".$libraryName.".js");
					$libraryPath = "";
					for($j = 0; $j < count($libraryLines); $j++) {
						//d($libraryLines[$j]);					
						$libPath = extractPart($libraryLines[$j], "//#f-b-", "-#");
						if($libPath != "") {
							//d( "libPath: \"".$libPath."\"");
							$libraryPath = $libPath."";
						}
						$libFileList = extractPart($libraryLines[$j], "//#l-b-", "-#");
						if($libFileList != "") {
							//d( "fileList: \"".$libFileList."\"");
							$fileList = explode(",",$libFileList);
							for($k = 0; $k < count($fileList); $k++) {
								$fileName = $fileList[$k];
								//d("fileName: \"".$fileName."\"");
								if(str_contains($fileName, ".css")) {
									$tempCss = file_get_contents($turdUrl."lib/".$libraryName."/".$libraryPath.$fileName);
									$tempCss = str_replace("../", $turdUrl."lib/".$libraryName."/".$libraryPath, $tempCss);
								} else if(str_contains($fileName, ".js")) {
									$siteJs .= file_get_contents($turdUrl."lib/".$libraryName."/".$libraryPath.$fileName);
								}
							}
						}
					}
					/*
					$packagePath = extractPart($line, "//#f-b-", "-#");
					echo "packagePath: \"".$packagePath."\"";
					*/
				}
			
				if(str_contains($line, "turdjs.importPackage(")) {
					$packageName =  extractPart($line, "turdjs.importPackage(\"", "\",c");
					//d("packageName: ".$packageName);	
					//d("turdUrl:\"".$turdUrl."js/"."import_package_".$packageName.".js"."\"");
					$packageList = file_get_contents($turdUrl."js/"."import_package_".$packageName.".js");
					//d("packageList: ".$packageList);			
					$packageLines = readLines($turdUrl."js/"."import_package_".$packageName.".js");
					for($j = 0; $j < count($packageLines); $j++) {
						//d($packageLines[$j]);
						$fileName = extractPart($packageLines[$j], "turdjs.loadLibraryFile(p+\"", "\",ch);");
						if($fileName != "") {
							if(str_contains($fileName, ".css")) {
								//d("file: \"".$turdUrl."css/".$packageName."/".$fileName."\"");
								$siteCss .= file_get_contents($turdUrl."css/".$packageName."/".$fileName);
							} else if(str_contains($fileName, ".js")) {
								//d("file: \"".$turdUrl."js/".$packageName."/".$fileName."\"");
								$siteJs .= file_get_contents($turdUrl."js/".$packageName."/".$fileName);
							}
						}
					}
				}
			
				if(str_contains($line, "turdjs.loadFile(s+")) {
					$cssFile = extractPart($line, "turdjs.loadFile(s+\"", "\",c);");
					//echo "cssFile: \"".$cssFile."\"</br>";
					$filePath = $siteDir.str_replace(".", "", $cssFolder).$cssFile;
					//echo "filePath: \"".$filePath."\"</br>";
					$siteCss .= file_get_contents($filePath);
				}
			
				if(str_contains($line, "turdjs.loadFile(j+")) {
					$jsFile = extractPart($line, "turdjs.loadFile(j+\"", "\",c);");				
					//echo "jsFile: \"".$jsFile."\"</br>";
					$filePath = $siteDir.str_replace(".", "", $jsFolder).$jsFile;
					//echo "filePath: \"".$filePath."\"</br>";
					$siteJs .= file_get_contents($filePath);
				}
				
				//echo "line: ".$line."</br>";
			
			}
		}
		/*
		echo "css: \"".$siteCss."\"";
		echo "css: \"".$siteJs."\"";
		*/
			
		$siteJs .= "turdjs.finish();";	
		
		$siteCss = str_replace("../../", "./", $siteCss);
		$filePath = dirname(__FILE__)."/scripts/";	
		$timeStamp = checkModificationDate(dirname(__FILE__), 0);
	
		//echo "filePath: ".$filePath;
		$cssFile = fopen($filePath."css_cache_".$timeStamp.".css", "w");
		$jsFile = fopen($filePath."js_cache_".$timeStamp.".js", "w");
	
		fwrite($cssFile, $siteCss);
		fclose($cssFile);
	
		fwrite($jsFile, $siteJs);
		fclose($jsFile);
		
		$timeStampFile = fopen($filePath."time_cache.txt", "w");
		fwrite($timeStampFile, $timeStamp);
		fclose($timeStampFile);
	
	} else {
		$filePath = dirname(__FILE__)."/scripts/";
		$timeStamp = intval(file_get_contents($filePath."/time_cache.txt"));
		$siteCss = file_get_contents($filePath."css_cache_".$timeStamp.".css");
		$siteJs = file_get_contents($filePath."js_cache_".$timeStamp.".js");
	}
	
	$appHtml = file_get_contents("./app.html");	
		
	$appHtml = str_replace('<style>.replaceMinified</style>', "<style>".$siteCss."</style>",  $appHtml);
	$appHtml = str_replace('<script type="text/javascript" charset="utf-8" >var replaceMinified;</script>', '<script type="text/javascript" charset="utf-8" >'.$siteJs."</script>",  $appHtml);
	
	echo $appHtml;
	
?>