console.log("loading main.js");

window.startApp = function() {
	console.log("starting app");
	var tm = TemplateManager.getInstance();
	tm.setServer(ServerManager.getInstance());
	tm.setTemplatePath("templates");
	tm.loadAll(
		["topic", "line", "entry", "link", "node_menu", "button"],
		function(){
			console.log("loaded templates");			
			initialize();
		}	
	);
};


var initialize = function() {
	console.log("initialize");
	/*
	for(var i = 0; i < document.body.childNodes.length; i++) {
		var child = document.body.childNodes[i];
		if(i > 0) {
			child.style = "visibility:hidden;display:none;";
		}		
	}
	*/
	
	var indexTable = {};
	
	var viewTabs = {
		defaultView : 0,
	};
		
	var appState = {};
	appState.menuExpanded = false;
	appState.currentTab = 0;
	appState.activeReturnFunction = "";
	
	var properties = {};
	properties.documentWidth = $(document).width();
	properties.documentHeight = $(document).height();
	
	
	
	console.log("docWidth: " + properties.documentWidth + " docHeight: " + properties.documentHeight);
		
	var menuOpened = false;
	var changeMenuState = function(open) {		
		if(open) {
			$('#menu').removeClass("menuClosed");
			$('#menu').addClass("menuOpened");
			$('#menuContent').show();
			$('#menuButtonGlyph').removeClass('glyphicon-chevron-right');
			$('#menuButtonGlyph').addClass('glyphicon-chevron-left');
		} else {			
			$('#menu').removeClass("menuOpened");
			$('#menu').addClass("menuClosed");
			$('#menuContent').hide();
			$('#menuButtonGlyph').removeClass('glyphicon-chevron-left');
			$('#menuButtonGlyph').addClass('glyphicon-chevron-right');
		}
		menuOpened = open;
	};
	
	changeMenuState(false);
	
	$('#openMenuButton').on("click", function(event, ui) {
		changeMenuState(!menuOpened);
	});
	
	$('#openMenuButton').on("mouseover", function(event, ui) {
		if(!menuOpened)  {
			changeMenuState(true);
		} else {
			changeMenuState(false);
		}
	});
	
	$('.menu').on('mouseout', function(event, ui) {
		if(menuOpened)  {
			if(event.pageX >= $('.menu').width()) {
				console.log("close menu on rollout");
				changeMenuState(false);
			} else {
				console.log("insied menu");
			}
		}
	});
		
	$('#viewMode').on( "selectmenuchange", function( event, ui ) {
		
	});
	 
	 window.menuButtonPressed = function(tabIndex, selectionMode, sortMode) {
		 console.log("menuButton pressed tabIndex: "+tabIndex+ " selectionMode: "+selectionMode+" sortMode: "+sortMode);
		 appState.selectionMode = selectionMode;
		 appState.listDisplayMode = sortMode;
		 changeViewTab(tabIndex);
		 $('#menuExpanded').hide();
		appState.menuExpanded = false;
		$('.ui-slider-handle').show();
	 };
		
	window.addEventListener("resize", function(){
		properties.documentWidth = $(document).width();
		properties.documentHeight = $(document).height();
	});
	
	appState.menuExpanded = false;
	$('#menuExpanded').hide();

	$('#menuBar').on('swiperight', function(event) {
		event.preventDefault();
		console.log("swiperight");
		if(!appState.menuExpanded) {
			console.log("expanding");
			$('#menuExpanded').show();
			appState.menuExpanded = true;
			$('.ui-slider-handle').hide();
		}
	});
	
	
	var HardDisk = function(index, size, price, brand, article) {
		//alert("new disk index: "+index+" size: "+size);
		if(size != undefined && price != undefined && brand != undefined && article != undefined) {			
			this.size = size;
			this.price = price;
			this.brand = brand;
			this.article = article;
		} else {
			//alert("size: "+size.innerHTML);
			this.size = size.children[0].children[0].innerHTML;
			this.price = size.children[1].children[0].innerHTML;
			this.brand = size.children[2].children[0].innerHTML;
			this.article = size.children[3].children[0].innerHTML;
		}
		this.index = parseInt(index);
		this.size = parseInt(this.size);
		this.price = parseInt(this.price);
	};
	
	var diskList = [];
	
	var getRaidVar = function(){
		var raidNum = parseInt(document.getElementById("configurations").value.replace("type_",""));
		if(raidNum == 0 || raidNum == 1 || raidNum == 5 || raidNum == 10 || raidNum == 50) {
			return (diskList.length > 0 ?  "&type=" : "type=")+raidNum;
		} else {
			return "";
		}
	};
	
	window.calculateRaid = function() {
		var option = document.getElementById("configurations").value;
		if(option == "type_5") {
			if(diskList.length < 3) {
				if((window.location.hash == "#" || window.location.hash == "") && getRaidVar() != "") {
					window.location.hash = "#"+getRaidVar();
				}
				return;
			}
		}
		
		var diskString = "#";
		for(var i = 0; i < diskList.length; i++) {
			diskString += diskList[i].index;
			if(i < diskList.length - 1) {
				diskString += "-";
			}
		}
		diskString += getRaidVar();
		window.location.hash = diskString;

		var resultField = document.getElementById("resultField");		
		//alert("option: "+option);
		var raidTable  = document.getElementById('raidTable');
		var entryList = raidTable.children[1].children;		
		var totalStorage = 0;
		var totalPrice = 0;
		if(option == "type_0") {			
			for(var i = 0; i < entryList.length; i++) {	
				totalStorage += diskList[i].size;				
			}			
		} else if(option == "type_1") {
			for(var i = 0; i < entryList.length; i+=2) {
				console.log("adding size of: "+i);
				if(entryList.length > i + 1) {
					totalStorage += diskList[i].size;
				}					
			}
			//totalStorage = totalStorage * 0.5;
		} else if(option == "type_5") {
			if(entryList.length < 4) {
				//alert("this should not be possible although 3 hdds is the minimum!");
				return;
			}
			var minSize = 999999999999999;
			for(var i = 0; i < entryList.length; i++) {	
				minSize = Math.min(minSize, diskList[i].size);	
			}
			totalStorage = minSize * 3;
		} else if(option == "type_50") {
			if(entryList.length < 6) {
				alert("this should not be possible although 6 hdds is the minimum!");
				return;
			} else {
				alert("this is not calculated yet due to work in progress");
			}
			/*
			var minSize = 0;
			for(var i = 0; i < entryList.length; i++) {	
				minSize = Math.min(minSize, parseInt(entryList[i].children[0].children[0].innerHTML), 0);	
			}
			totalStorage = minSize * 3;
			*/
		}
		for(var i = 0; i < entryList.length; i++) {		
			totalPrice += diskList[i].price;
		}
		document.getElementById("resultField").innerHTML =  "Storage: "+totalStorage+" Cost: "+totalPrice;
		
	};

	var createFunctionTwo = function(i) {
		var index = i+0;
		return function() {
			//alert("delete: " + index);
			diskList.splice(index, 1);
			createRaidTable();
		};
	};
	
	
	var createRaidTable = function() {
		var raidTable  = document.getElementById('raidTable').children[1];	
		var tableContent = "";
		for(var i = 0; i < diskList.length; i++) {
			var d = diskList[i];
			tableContent += "<tr>";
			tableContent +='<td><div class= "contentCell">'+d.size+"</div></td>";
			tableContent +='<td><div class= "contentCell">'+d.price+"</div></td>";
			tableContent +='<td><div class= "contentCell">'+d.brand+"</div></td>";
			tableContent +='<td><div class= "contentCell">'+d.article+"</div></td>";
			tableContent +='<td style = "width: 20px;"><div class= "contentCell" style = "font-weight: bold;">-</div></td>';
			tableContent += "</tr>";
		}
		raidTable.innerHTML = tableContent;			
		raidTable  = document.getElementById('raidTable');			
		var entryList = raidTable.children[1].children;
		for(var i = 0; i < entryList.length; i++) {
			var entry = entryList[i];
			entry.replaceWith(entry.cloneNode(true));
		}
		raidTable  = document.getElementById('raidTable');
		entryList = raidTable.children[1].children;
		for(var i = 0; i < entryList.length; i++) {
			var entry = entryList[i];
			entry.children[4].children[0].addEventListener("click", createFunctionTwo(i));
		}
		calculateRaid();
	};
	
	var createFunction = function(i) {
		if(diskList.length >= 4) {
			alert("4 disks is the current maximum, remove one first!");
			return;
		}
		var index = i+0;
		return function(i) {
			var entries = hddTable.children[1].children;
			var entry = entries[index];			
			/*var raidTable  = document.getElementById('raidTable').children[1];			*/			
			var disk = new HardDisk(index, entry);
			diskList.push(disk);
			
			diskList.sort(function(a, b){
					return a.price-b.price
				}			
			);
			
			diskList.sort(function(a, b){
					return a.size-b.size
				}			
			);
			
			createRaidTable();
		};
	};
		
	var hddTable = document.getElementById('hddTable');
	var raidTable  = document.getElementById('raidTable');
	var entries = hddTable.children[1].children;
	var raidEntries = raidTable.children[1].children;
	//alert("raidTable.children[1].length: "+raidTable.children[1].children.length);
	for(var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		entry.children[4].children[0].addEventListener("click", createFunction(i));
	}
	
	for(var i = 0; i < raidEntries.length; i++) {
		var entry = raidEntries[i];
		entry.children[4].children[0].addEventListener("click", createFunctionTwo(i));
	}
		
	var hashString = window.location.hash;
	if(hashString.indexOf("#") > -1 || hashString.indexOf("&type=") > -1) {
		var hddString = hashString;
		var hddArray = "";
		var raidConfig = 0;
		if(hashString.indexOf("&type=") > -1) {
			console.log("hdds and type");
			raidConfig = hashString.substring(hashString.indexOf("&type=")+6, hashString.length);
			hddString = hashString.substring(0, hashString.indexOf("&type="));
			hddString = hddString.replace("#", "");
			console.log("config: "+raidConfig);
		} else if(hashString.indexOf("type=") > -1) {
			console.log("only type");
			raidConfig = hashString.substring(hashString.indexOf("type=")+5, hashString.length);
			hddString = hashString.substring(0, hashString.indexOf("type="));
			console.log("config: "+raidConfig);
		} 
		hddString = hddString.replace("#", "");
		console.log("raidconfig: "+raidConfig);
		console.log("hddstring: "+hddString);
		if(!isNaN(raidConfig)) {
			console.log("is number");
			var raidNum = parseInt(raidConfig);
			if(raidNum == 0 || raidNum == 1 || raidNum == 5 || raidNum == 10 || raidNum == 50) {
				console.log("setting raidConfig: "+raidConfig);
				document.getElementById("configurations").value = "type_"+ parseInt(raidConfig);				
			} else {
				alert("invalid raid configuration: "+raidNum);
			}
		}
		hddArray = hddString.split("-");
		if(hddArray != "") {
			//alert("hddArray: \""+hddArray+"\" len: "+hddArray.length);
			diskList = [];
			var raidTable  = document.getElementById('raidTable');
			var entries = hddTable.children[1].children;
			for(var i = 0; i < hddArray.length; i++) {
				var hdId = parseInt(hddArray[i]);
				var disk = new HardDisk(hdId, entries[hdId]);
				diskList.push(disk);			
			}
		}
	}
	
	createRaidTable();	
	window.calculateRaid();
	
};
