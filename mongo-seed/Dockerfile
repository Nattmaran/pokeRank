FROM mongo
RUN mkdir /init.json
COPY . /init.json
CMD mongoimport --host mongodb --db pokemon --collection skills --type json --file /init.json/skills.json --jsonArray
CMD mongoimport --host mongodb --db pokemon --collection pokemon --type json --file /init.json/pokedex.js --jsonArray
CMD mongoimport --host mongodb --db pokemon --collection types --type json --file /init.json/types.json --jsonArray
