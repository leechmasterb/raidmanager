var sortArray = function(array, field, ascending) {
	array.sort(function(a, b) {
		var nameA = a[field];
		var nameB = b[field]; 
		if (nameA < nameB) {
			return ascending ? -1 : 1;
		}
		if (nameA > nameB) {
			return ascending ? 1 : -1;
		}
		return 0;
	}); 
};