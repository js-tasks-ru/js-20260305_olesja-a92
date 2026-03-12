/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
	const returnedArr = arr.slice();
	const directions = { asc: 1, desc: -1 };
	if(directions[param] === undefined) throw new Error("Неизвестное значение param!");
	
	returnedArr.sort( (a,b) => {
		 return a.localeCompare(b, ["ru","en"], {caseFirst: "upper"}) * directions[param];
	});
	
	return returnedArr;
}