import pymongo
from config import MONGODB_PORT,MONGODB_HOST

class MongoClient():
    def __init__(self, db, db_name, host=MONGODB_HOST, port=MONGODB_PORT):
        self.client = pymongo.MongoClient(host=host, port=port)
        self.db = self.client[db]
        self.set = self.db[db_name]

    def Client(self):
        return self.set

    def district_num(self):
        func = '''
                        function(obj,prev)
                        {
                            prev.sum++;
                        }

        '''
        num = self.set.group(['district'], None, {'sum': 0}, func)
        #去除未知领域
        return num[0:-1]

    def position_num(self):
        func = '''
                        function(obj,prev)
                        {
                            prev.sum++;
                        }

        '''
        num = self.set.group(['position'], None, {'sum': 0}, func)
        big_30 = [i for i in num if i['sum']>30]
        return big_30

    def community_num(self):
        func = '''
                        function(obj,prev)
                        {
                            prev.sum++;
                        }

        '''
        num = self.set.group(['community'], None, {'sum': 0}, func)
        return num


    def community_num(self):
        func = '''
                        function(obj,prev)
                        {
                            prev.sum++;
                        }

        '''
        num = self.set.group(['community'], None, {'sum': 0}, func)
        return num

    def find(self, **kwargs):
        content =self.set.find(kwargs)
        data = []
        for i in content:
            data.append(i)
        return data


housingDB = MongoClient('fangyuan','housing')
# print(housingDB.community_num())
# print(housingDB.find(price=5000))
# id = housingDB.find_one()['_id']
# print(id)
# housingDB.update_one({'_id': id}, {'$set': {'ceshi':'ceshi'}})

# func = '''
#                 function(obj,prev)
#                 {
#                     prev.sum++;
#                 }
#
# '''
# b = MongoClient('fangyuan','base_url')
# myset = b.db['housing']
# a = myset.group(['district'],None,{'sum':0},func)
# # myset.update()
# for i in a:
#     print(i['district'])
# #  myset.aggregate({'$group':'group'})
