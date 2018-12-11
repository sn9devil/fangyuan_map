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
        #去除未知领域
        return num[0:-1]

housingDB = MongoClient('fangyuan','housing')
print(housingDB.position_num())
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
