/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size ) {
	if (typeof string !== 'string') return '';
	if (typeof size === 'undefined') size = string.length;
	if (typeof size !== 'number') return '';

	const strArr = string.split('');
	
	return strArr.reduce(({str, count, lastChar}, letter) => {
		const newCount = letter === lastChar ? count + 1 : 0;
		
		return {
			str: newCount < size ? str + letter : str,
			count: newCount,
			lastChar: letter
		};
	}, {str:'', count:0, lastChar: ''}).str;
}