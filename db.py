import pymongo
from config import MONGODB_PORT,MONGODB_HOST

class MongoClient():
    def __init__(self,db_name,host=MONGODB_HOST,port=MONGODB_PORT):
        self.client = pymongo.MongoClient(host=host,port=port)
        self.db = self.client[db_name]

#
b = MongoClient('fangyuan')
myset = b.db['base_url']
myset.aggregate({'$group':{'_id':'$community','num':{'$sum':1}}})