import json
import urllib.request
from html.parser import HTMLParser
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageOps
import os


# print(os.chdir('assets'))
# print(os.getcwd())
with open('src/assets/pieChart_v1_data.json', 'r') as file:
	data = json.load(file)
	res = []
	for app in data:
		# print(data[app])
		if app['Website'] not in res and app['Website'] not in ['localhost'] :
			splittedWeb = app['Website'].split('.')
			lenSplitted = len(splittedWeb)

			if lenSplitted == 3 and splittedWeb[0] == 'www':
				res.append(splittedWeb[1])
			elif lenSplitted == 3 and splittedWeb != 'www':
				res.append(splittedWeb[0])
			else :
				res.append(splittedWeb[0])
			# res.append(app['Website']) 

	print(res)

	file.close()

files = os.listdir('src/assets/logos/')

for d in res:
	print(d)
	d = '-'.join(d.split('/'))
	if not d.lower() in files:
		os.mkdir('src/assets/logos/' + d.lower())

		fp = urllib.request.urlopen("https://play.google.com/store/search?q=" + urllib.parse.quote(d) + "&c=apps&hl=fr")

		page = BeautifulSoup(fp, 'html.parser')

		# icon_tag = page.find_all('span', class_ = 'yNWQ8e K3IMke buPxGf')
		# 'div',{'id':'TableWithRules'}
		icon_tag = page.find_all('span',{'class':'yNWQ8e K3IMke buPxGf'})
		print(icon_tag[0].find('span'))

		icon_url = icon_tag[0].find('span').find('img').get('data-src')

		d = d.lower()

		urllib.request.urlretrieve(icon_url, "src/assets/logos/" + d + "/logo_" + d + ".jpg")

		print('reading image : ' + d)
		im = Image.open('src/assets/logos/' + d + '/logo_' + d + '.jpg')

		w, h = im.size

		### GET BEST COLOR ###
		
		rgb_im = im.convert('RGB')

		temp = {}

		for i in range(w):
			for j in range(h):
				rgb = rgb_im.getpixel((i, j))

				if not rgb in temp:
					temp[rgb] = 0
				temp[rgb] += 1


		t = temp.copy()

		for j in range(256):
			if (j, j, j) in temp: temp.pop((j, j, j))

		if len(temp) == 0:
			res = t
			if (0, 0, 0) in res: res.pop((0, 0, 0))
			if (255, 255, 255) in res: res.pop((255, 255, 255))
			
		else:
			res = temp

		colour = max(res, key=res.get)


		with open('src/assets/logos/' + d + '/best_color.txt', 'w+') as file:
			file.write(' '.join([str(i) for i in colour]))
			file.close()


		### LOGO AS CIRCLE ###

		bigsize = (im.size[0] * 3, im.size[1] * 3)
		mask = Image.new('L', bigsize, 0)
		draw = ImageDraw.Draw(mask) 
		draw.ellipse((0, 0) + bigsize, fill=255)
		mask = mask.resize(im.size, Image.ANTIALIAS)
		im.putalpha(mask)

		output = ImageOps.fit(im, mask.size, centering=(0.5, 0.5))
		output.save('src/assets/logos/' + d + '/logo_circle.png')


		### REMOVE OLD IMAGE ###

		os.remove('src/assets/logos/' + d + '/logo_' + d + '.jpg')


