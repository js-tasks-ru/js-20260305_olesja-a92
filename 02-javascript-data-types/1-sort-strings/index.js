/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
	let returnedArr = arr.slice();
	returnedArr.sort( (a,b) => {
		 return a.localeCompare(b, ["ru","en"], {caseFirst: "upper"}) * (param==='desc'?-1:1);
	});
	
	return returnedArr;
}