/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = string.length) {
	if (typeof string !== 'string') return '';
	if (typeof size !== 'number') return '';
	
	const strArr = string.split('');
	let currentSize = 0;
	let currentLetter = '';
	
	return strArr.reduce((accStr, letter) => {
		currentSize = letter === currentLetter? currentSize+1: 0;
		currentLetter = letter === currentLetter? currentLetter : letter;
		
		return currentSize < size ? accStr+letter : accStr;
	}, currentLetter);
}