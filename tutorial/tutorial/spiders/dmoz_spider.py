from scrapy.spider import Spider
from scrapy.selector import Selector

from tutorial.items import DmozItem

class ManhattanInnSpider(Spider):
	name = "dmoz"
	allowed_domains = ["blogspot.com"]
	start_urls = [
		"http://manhattaninn.blogspot.com/"
	]

	def parse(self, response):
		sel = Selector(response)
		sites = sel.xpath('//ul/li')
		items = []

		for site in sites:
			item = DmozItem()
			item['title'] = site.xpath('a/text()').extract()
			item['link'] = site.xpath('a/@href').extract()
			item['desc'] = site.xpath('text()').extract()
			items.append(item)

		return items

		# filename = response.url.split("/")[-2]
		# open(filename, 'wb').write(response.body)

		# sel.css('span[style="font-size: large;"]').extract();