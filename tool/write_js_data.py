from db import housingDB
nums = housingDB.community_num()
DB = housingDB.Client()


if __name__ == '__main__':
    with open('data.js', 'a', encoding='utf-8') as f:
        f.write('var data = [')
        for num in nums:
            community = DB.find_one({'community':num['community']})['location']
            str_data = '{"lnglat":[' + community + '],"num":' + str(int(num['sum'])) +',"name":"'+num['community']+'"},'
            f.write(str_data)
        f.write(']')

        