/*---------------
   main.js
  ---------------*/



"use strict";

// Controller code for GIF Parade

// Super-lightweight data access layer to handle image query / retrieval
// currently leverages the Giphy API, although it's written in a way that
// ideally makes is straightforward to adapt to other public APIs.
const ImageStore = {
	findGifs: (query, fnOk, fnError) => {
		let encodedQuery = query.replace(/\W/g, "+");
		fetch(`http://api.giphy.com/v1/gifs/search?q=${encodedQuery}&api_key=dc6zaTOxFJmzC`)
		.then(function(response) {
			if(response.ok) {
				return response.json();
			}
			throw new Error('Network response was not ok.');
		})
		.then(fnOk || function(data) { 
			console.debug(data);
		})
		.catch(fnError || function(error) {
			console.error('There has been a problem with your fetch operation: ' + error.message);
		});
	}
};

function createImg(data) {
	if (data && data.images.original.url) {
		let img = document.createElement("img");
		img.src = data.images.original.url;
		img.title = data.slug;

		return img;
	}
}

// app controller
const App = {
	// handle initial page setup
	init() {
		this.lightbox = document.createElement("div");
		this.lightbox.className = "lightbox";
		document.body.appendChild(this.lightbox);
	},
	search(query) {
		ImageStore.findGifs(query,
			((response) => response.data.map(createImg).forEach(img => lightbox.appendChild(img))),
			((err) => console.error(err)));
	}
}

App.init();