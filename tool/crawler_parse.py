import requests
from bs4 import BeautifulSoup
import time
from db import MongoClient
from lxml import etree

header = {
    'cookie':'TY_SESSION_ID=b65e5db3-31e9-4072-bc78-b061b26e408f; lianjia_uuid=3cbc45f7-d93a-4af1-9fb3-29d52917bbba; _smt_uid=5c0628b7.16ba44a5; UM_distinctid=167780f0d61120-0b15f801ba7a44-6313363-1fa400-167780f0d62364; _jzqa=1.3754516082481336300.1543907512.1543907512.1543907512.1; _jzqc=1; _jzqckmp=1; _ga=GA1.2.1681518055.1543907514; _gid=GA1.2.428787813.1543907514; lianjia_ssid=016e2c0f-daa8-4cb0-aee8-9895618c91a0; Hm_lvt_9152f8221cb6243a53c83b956842be8a=1543907511,1543907524; _jzqy=1.1543907512.1543907524.2.jzqsr=baidu|jzqct=%E9%93%BE%E5%AE%B6.jzqsr=baidu; select_city=440100; all-lj=8e5e63e6fe0f3d027511a4242126e9cc; CNZZDATA1254525948=1032313572-1543907664-%7C1543907664; _qzjc=1; CNZZDATA1255633284=1171841482-1543902514-%7C1543907914; Hm_lpvt_9152f8221cb6243a53c83b956842be8a=1543908350; CNZZDATA1255849599=1877321945-1543902825-%7C1543903213; CNZZDATA1255604082=1443315281-1543902662-%7C1543904681; _qzja=1.2071815324.1543907705705.1543907705705.1543907705705.1543907914572.1543908350302.0.0.0.6.1; _qzjb=1.1543907705705.6.0.0.0; _qzjto=6.1.0; _jzqb=1.19.10.1543907512.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
          }
url = 'https://gz.lianjia.com/zufang/108200046963.html'

def parse(request_url):
    html = requests.get(request_url, headers=header)
    XML_tree = etree.HTML(html.text)
    html.encoding = 'utf8'
    soup = BeautifulSoup(html.text, 'lxml')
    url = html.url
    print(url)
    title = soup.select_one('.main').text
    price = soup.select_one('.total').text
    img = soup.select_one('.thumbnail img').get('src') if soup.select_one('.thumbnail img') else None
    area = XML_tree.xpath('//p[@class="lf"]/text()')[0]
    house_type = XML_tree.xpath('//p[@class="lf"]/text()')[1]
    quyu = XML_tree.xpath('//div[@class="zf-room"]/p/a/text()')
    community = quyu[0]
    district = quyu[2]
    position = quyu[3]
    house_list = {
        'url': url,
        'title': title,
        'img': img,
        'price': int(price),
        'area': area,
        'house_type': house_type,
        'community': community,
        'district': district,
        'position': position
    }
    return house_list


if __name__ == '__main__':
    myset = MongoClient('fangyuan', 'base_url').Client()
    housing = MongoClient('fangyuan', 'housing').Client()
    erroe_url = MongoClient('fangyuan', 'erroe_url').Client()
    url_list = myset.find()
    num = 0
    for i in url_list:
        num += 1
        print('正在抓取第{}个。{}/6000'.format(num, num))
        try:
            content = parse(i['url'])
        except Exception as e:
            try:
                content = parse(i['url'])
            except Exception as e:
                print('爬取失败' + i['url'])
                erroe_url.insert_one({'url':i['url']})

        housing.update_one({'url': i['url']}, {'$set': content}, True)
        print(content)
        time.sleep(0.5)
# a = parse(url)
# print(a)