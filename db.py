import pymongo
from config import MONGODB_PORT,MONGODB_HOST

class MongoClient():
    def __init__(self,db_name,host=MONGODB_HOST,port=MONGODB_PORT):
        self.client = pymongo.MongoClient(host=host,port=port)
        self.db = self.client[db_name]

    def Client(self):
        return self.db


# func = '''
#                 function(obj,prev)
#                 {
#                     prev.sum++;
#                 }
#
# '''
# b = MongoClient('fangyuan')
# myset = b.db['base_url']
# a = myset.group(['community'],None,{'sum':0},func)
# myset.update()
# print(a)
#  myset.aggregate({'$group':'group'})
