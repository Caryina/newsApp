const url = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml";

// convert the date into a more readable format
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

// Sort specifies how the news items should be sorted (by date or by title)
// searchTerm filters the news items by title.
const getNews = async (sort, searchTerm) => {
  const response = await fetch(url);
  const xml = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const items = [...doc.querySelectorAll("item")];
  if (sort === "date-asc") {
    items.sort(
      (a, b) =>
        new Date(a.querySelector("pubDate").textContent) -
        new Date(b.querySelector("pubDate").textContent)
    );
  } else if (sort === "date-desc") {
    items.sort(
      (a, b) =>
        new Date(b.querySelector("pubDate").textContent) -
        new Date(a.querySelector("pubDate").textContent)
    );
  } else if (sort === "title-asc") {
    items.sort((a, b) =>
      a
        .querySelector("title")
        .textContent.localeCompare(b.querySelector("title").textContent)
    );
  } else if (sort === "title-desc") {
    items.sort((a, b) =>
      b
        .querySelector("title")
        .textContent.localeCompare(a.querySelector("title").textContent)
    );
  }
  const filteredItems = searchTerm
    ? items.filter((item) =>
        item
          .querySelector("title")
          .textContent.toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : items;
  return filteredItems.map((item) => ({
    title: item.querySelector("title").textContent,
    link: item.querySelector("link").textContent,
    description: item.querySelector("description").textContent,
    pubDate: parseDate(item.querySelector("pubDate").textContent),
  }));
};

const form = document.querySelector("form");
const newsContainer = document.querySelector("#news");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const sort = form.elements.sort.value;
  const searchTerm = form.elements.search.value;
  const news = await getNews(sort, searchTerm);
  newsContainer.innerHTML = news
    .map(
      (item) => `
				<div class="news-item">
					<h2><a href="${item.link}">${item.title}</a></h2>
					<p>${item.description}</p>
					<p>Published: ${item.pubDate}</p>
				</div>
			`
    )
    .join("");
});
form.dispatchEvent(new Event("submit"));
