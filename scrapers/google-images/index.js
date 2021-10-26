const axios = require('axios');
const cheerio = require("cheerio");

module.exports = {

    getImage: async function (query) {
        try {
            const { data } = await axios(`https://www.google.com/search?q=${query}&tbm=isch&sclient=img`);
    
            if (data) {
                const $ = cheerio.load(data);

                let img = $('table table a img').first();

                if (img)
                    return decodeURI(img.attr('src'));

            }            
        } catch (error) {
            throw new Error('Ocorreu um erro ao buscar a imagem no Google');
        }
    }
}