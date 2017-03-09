/*---------------
   main.js
  ---------------*/

/* globals console */

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

function createNode(el, classes="", attrs={}) {
	let node = document.createElement(el);
	if (classes) node.className = classes;
	Object.keys(attrs).forEach(key => {
	node[key] = attrs[key];
	});
	return node;
}

function createButton(parent, label, classes, fnClick) {
	let btn = document.createElement("button");
	btn.innerHTML = label;
	if (classes) btn.className = classes;
	btn.addEventListener("click", fnClick);
	parent.appendChild(btn);

	return btn;
}

function createImg(data, idx) {
	if (data[idx] && data[idx].images.original.url) {
		let img = createNode("img", "thumb", {
			src: data[idx].images.original.url,
			title: data[idx].slug
		});
		img.dataset.index = idx;
		return img;
	}
}

function Parade(query, parent, idx) {
	this.gifs = [];
	this.list = createNode("div", "thumb-collection");
	this.list.dataset.id = idx;

	parent.appendChild(this.list);

	ImageStore.findGifs(query,
		((response) => {
			[].push.apply(this.gifs, response.data);

			for (var i=0; i<3; i++) {
				this.list.appendChild(
					createImg(this.gifs, i));
			}

		}),
		((err) => console.error(err)));
}
Parade.prototype = {
	fetchNext() {
		// TBD
	}
};

function Lightbox() {
	this.root = createNode("div", "lightbox hidden");
	createButton(this.root, "&times;", "lightbox-button lightbox-close", this.hide.bind(this));
	this.btnPrev = createButton(this.root, "&lsaquo;", "lightbox-button lightbox-prev", this.prev.bind(this));
	
	this.img = createNode("img", "lightbox-image");
	this.root.appendChild(this.img);

	this.btnNext = createButton(this.root, "&rsaquo;", "lightbox-button lightbox-next", this.next.bind(this));

	document.body.appendChild(this.root);
}
Lightbox.prototype = {
	show(parade, imgIndex) {
		this.parade = parade;
		this.setImgIndex(imgIndex);
		this.root.classList.remove("hidden");
	},
	setImgIndex(idx) {
		this.imageIndex = idx;

		let isFirst = (idx == 0);
		let isLast = (idx >= this.parade.gifs.length-1);

		this.btnPrev.classList[isFirst ? 'add' : 'remove']("button--disabled");
		this.btnNext.classList[isLast ? 'add' : 'remove']("button--disabled");

		this.img.src = ''; // set it to null first so any previously displayed image is cleared even before the new image loads
		this.img.src = this.parade.gifs[idx].images.original.url;
	},
	hide() {
		this.root.classList.add("hidden");
	},
	prev() {
		if (this.imageIndex > 0) {
			this.setImgIndex(this.imageIndex-1);
		}
	},
	next() {
		if (this.imageIndex < this.parade.gifs.length-1) {
			this.setImgIndex(this.imageIndex+1);
		}
	}
};


// app controller
const App = {
	// handle initial page setup
	init() {
		this.lightbox = new Lightbox();
		this.parades = [];
		this.searchbox = document.querySelector("#query");
		this.paradeGrounds = document.querySelector("#parade-container");
		this.paradeGrounds.addEventListener("click", (evt) => {
			if (evt.target.classList.contains("thumb")) {
				let paradeNum = parseInt(evt.target.parentNode.dataset.id);
				let imgIdx = parseInt(evt.target.dataset.index);
				this.lightbox.show(this.parades[paradeNum], imgIdx);
			}
		});
		document.querySelector("form").addEventListener("submit", (evt) => {
			evt.preventDefault();
			this.search(this.searchbox.value);
		});
		document.addEventListener("keydown", (evt) => {
			switch (evt.keyCode) {
				case 27:	// ESC
					this.lightbox.hide();
					break;
				case 37:	// left arrow
					this.lightbox.prev();
					break;
				case 39:	// right arrow
					this.lightbox.next();
					break;
			}
		});
	},
	search(query) {
		this.parades.push( new Parade(query, this.paradeGrounds, this.parades.length) );
	}
};

App.init();