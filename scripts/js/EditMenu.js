
function EditMenu(menuElement, switchStates, className, output){
	this.menuElement = menuElement;
	this.buttonMap = [];
	this.buttonList = [];
	this.wrapperList = [];
	//alert("this menuElement id: "+menuElement.id);
	for(var i = 0; i < this.menuElement.childNodes.length; i++) {
		var menuWrapper = this.menuElement.childNodes[i];
		if(!menuWrapper.id || menuWrapper.id.substring(0, 6) != "button") {
			continue;
		}
		this.wrapperList.push(menuWrapper);
		var button = menuWrapper.childNodes[0];
		//if(output)
		//	alert("menuWrapper id: "+menuWrapper.id);
		//alert("button id: "+button.id);
		if(button.id && button.id.substring(0, 6) == "button") {
			//alert("childNode id: "+button.id);
			this.buttonList.push(button);
		}
		//if(output)
			//alert("menuWrapper: "+menuWrapper);
		if(button.id == "buttonAdd") {
			console.log("found button add");
			//alert("found add button");
			this.buttonMap["add"] = button;
		} else if(button.id == "buttonEdit") {
			this.buttonMap["edit"] = button;
		} else if(button.id == "buttonMoveUp") {
			this.buttonMap["move_up"] = button;
		} else if(button.id == "buttonMoveDown") {
			this.buttonMap["move_down"] = button;
		} else if(button.id == "buttonDelete") {
			this.buttonMap["delete"] = button;
		} else if(button.id == "buttonOk") {
			this.buttonMap["ok"] = button;
		} else if(button.id == "buttonCancel") {
			this.buttonMap["cancel"] = button;
		}		
	}
	this.switchStates = [];
	if(switchStates) {
		this.switchStates = switchStates;
		if(switchStates["default"]) {
			this.setState("default");
		}
	}
	if(className) {
		this.setClass(className);
	}
}

EditMenu.prototype.setClass = function(className) {
	this.menuElement.classList.add(className);
};

EditMenu.prototype.setState = function(stateName) {	
	var newState = this.switchStates[stateName];
	for(var i = 0; i < newState.length; i++) {
		var element = this.wrapperList[i];
		element.classList.remove("hidden");
		if(newState[i] == false) {
			element.classList.add("hidden");
		} 
	}	
};

EditMenu.prototype.addEventListener = function(buttonName, eventName, callbackFunction) {
	this.buttonMap[buttonName].addEventListener(eventName, callbackFunction);	
};

EditMenu.prototype.addRemoveEventListener = function(buttonName, eventName, callbackFunction) {	
	this.buttonMap[buttonName].removeEventListener(eventName, callbackFunction);	
};
