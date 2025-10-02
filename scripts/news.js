const feeds = {
	hn: { type:"hn" },
	lobsters: { type:"rss", url:"https://lobste.rs/rss" }
};

const $ = id => document.getElementById(id);

function escape_html(s)
{
	return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}

function fetchWithTimeout(url, opts={}, ms=10000)
{
	return Promise.race([
		fetch(url, opts),
		new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")), ms))
	]);
}

async function fetch_rss(url)
{
	const bust = Date.now();
	const proxied = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url) + "&t=" + bust;
	const r = await fetchWithTimeout(proxied, {cache:"no-store"});
	return r.text();
}

async function load_feed(platform, count)
{
	const list = $("articles-list");
	if (!list) {
		return console.error("#articles-list missing");
	}
	list.innerHTML = "<h5>loading…</h5>";

	try {
		if (feeds[platform]?.type === "hn") {
			let ids = await fetchWithTimeout("https://hacker-news.firebaseio.com/v0/topstories.json",{cache:"no-store"}).then(r=>r.json());
			ids = ids.slice(0, count);
			const items = await Promise.all(ids.map(id =>
				fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`,{cache:"no-store"}).then(r=>r.json())
			));
			list.innerHTML = items.map(it =>
				`<li><a href="${it.url || 'https://news.ycombinator.com/item?id='+it.id}">${escape_html(it.title)}</a></li>`
			).join('');
			return;
		}

		if (feeds[platform]?.type === "rss") {
			const xml = await fetch_rss(feeds[platform].url);
			const doc = new DOMParser().parseFromString(xml,"text/xml");
			const items = [...doc.querySelectorAll("item")].slice(0, count);
			if (!items.length) throw new Error("no <item> nodes");
			list.innerHTML = items.map(it=>{
				const link = it.querySelector("link")?.textContent?.trim() || "#";
				const title = it.querySelector("title")?.textContent?.trim() || "(no title)";
				return `<li><a href="${link}">${escape_html(title)}</a></li>`;
			}).join('');
			return;
		}

		throw new Error("unknown platform: "+platform);
	} catch (e) {
		console.error(e);
		list.innerHTML = `<li><em>Failed to load (${escape_html(String(e.message||e))}). Try again.</em></li>`;
	}
}

/* feed */
	$("articles-refresh").addEventListener("click", ()=>{
		const platform = $("platform")?.value || "hn";
		const n = Math.max(1, Math.min(500, parseInt($("articles")?.value,10) || 10));
		load_feed(platform, n);
	});

var platform = document.getElementById("platform").value;
var n = Math.max(1, Math.min(500, parseInt($("articles")?.value)));

const sel=$("platform"), num=$("articles");
sel.value = localStorage.getItem("platform");
num.value = localStorage.getItem("articles");
$("articles-refresh").addEventListener("click", ()=>{
	localStorage.setItem("platform", sel.value);
	localStorage.setItem("articles", num.value);
});
