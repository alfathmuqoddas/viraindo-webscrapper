# Viraindo Webscrapper

This is a simple Astro project that scrapes the [Viraindo](https://viraindo.com) website and then generate a static website and api with the scraped data. It utilize astrojs powerful static-site generation and the [Cheerio](https://cheerio.js.org/) library to scrape the data. [Viraindo](https://viraindo.com) is a pc component store that provides rich pc components and gadget price data but in the form of barebones html site instead of a restful json api. That's why this project is created to provide a restful api of the website by scraping the html site, and filter out some unnecessary data. It's not a perfect solution since the html site is not designed to be scraped, but it works for now.

## Demo

UI Static Site: [https://alfathmuqoddas.github.io/viraindo-webscrapper/](https://alfathmuqoddas.github.io/viraindo-webscrapper/)

API: [https://alfathmuqoddas.github.io/viraindo-webscrapper/api/processor/intel.json](https://alfathmuqoddas.github.io/viraindo-webscrapper/api/processor/intel.json)

## Tech Stack

- Astro
- Preact
- Tailwind CSS
- Cheerio

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the project with `npm run dev`
4. Open [http://localhost:4321](http://localhost:4321) to view the app
