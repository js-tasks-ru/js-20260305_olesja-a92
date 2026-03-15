/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
	if (typeof path !== 'string') throw new Error('Необходимо передать строку!');
		
	const pathArray = path.split('.');
	
	return (obj) => {
		if (typeof obj !== 'object' || obj === null) throw new Error('Необходимо передать объект!');
		
		return pathArray.reduce((accumObj, item) => {
			if(accumObj === undefined) return undefined;
			
			return accumObj.hasOwnProperty(item)?accumObj[item]:undefined;
		}, obj);
	} 
}