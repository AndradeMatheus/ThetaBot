import axios from 'axios';
import { load } from 'cheerio';

export const getImage = async function(
	query: string,
): Promise<string | undefined> {
	try {
		const { data } = await axios(
			`https://www.google.com/search?q=${query}&tbm=isch&sclient=img&safe=off`,
		);

		if (data) {
			const $ = load(data);

			const img = $('table table a img').first();
			const src = img?.attr('src');

			if (src) return decodeURI(src);

			return undefined;
		}
	}
	catch (error) {
		throw new Error('Ocorreu um erro ao buscar a imagem no Google');
	}
};
