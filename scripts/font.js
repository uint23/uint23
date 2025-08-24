const fonts = ["sans-serif", "Georgia, serif", "Courier New"];
const btn = document.getElementById("font-selector");

let current = parseInt(localStorage.getItem("font_index") || "0", 10);
document.body.style.fontFamily = fonts[current];

btn.addEventListener("click", () => {
	current = (current + 1) % fonts.length;
	document.body.style.fontFamily = fonts[current];
	localStorage.setItem("font_index", current);
});
