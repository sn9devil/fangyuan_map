import requests
from db import housingDB
from config import gaodeKEY
import json
base_url = 'https://restapi.amap.com/v3/geocode/geo?city=020&key={}&address={}'


def convert_geocode():
    DB = housingDB.Client()
    for content in DB.find():
        id = content['_id']
        address = content['district'] + '区' + content['community']
        url = base_url.format(gaodeKEY, address)
        try:
            html = requests.get(url)
            geocodes = json.loads(html.text).get("geocodes", None)
            if(geocodes):
                location = geocodes[0].get('location', None)
            DB.update_one({'_id': id}, {'$set': {'location': location}})
            print(location)
        except Exception as e:
            print(id,address)


if __name__ == '__main__':
    convert_geocode()