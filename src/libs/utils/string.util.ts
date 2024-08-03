export const toTitleCase = (sentence?: string | null) => {
	if (!sentence) return null;

	return sentence.replaceAll(/\w\S*/gu, (word) => {
		return word[0].toUpperCase() + word.slice(1).toLowerCase();
	});
};

export const removeDiacritics = (str: string | null) => {
	if (!str) return null;

	return str
		.toString()
		.normalize('NFD')
		.replaceAll(/[\p{Diacritic}\u0027\u0142]/gu, '');
};

export const removeSpecialChars = (sentence?: string | null) => {
	if (!sentence) return null;

	return sentence.replaceAll(/[\n\r]+/gu, '').replaceAll(/\t+/gu, ' ');
};
