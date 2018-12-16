import pymongo
from config import MONGODB_PORT, MONGODB_HOST


class MongoClient():
    def __init__(self, db, db_name, host=MONGODB_HOST, port=MONGODB_PORT):
        self.client = pymongo.MongoClient(host=host, port=port)
        self.db = self.client[db]
        self.set = self.db[db_name]
        self.num_func = '''
                                function(obj,prev)
                        {
                            prev.sum++;
                        }
                        '''

    def Client(self):
        return self.set

    def district_num(self):
        num = self.set.group(['district'], None, {'sum': 0}, self.num_func)
        # 去除未知领域
        return num[0:-1]

    def position_num(self):
        num = self.set.group(['position'], None, {'sum': 0}, self.num_func)
        big_30 = [i for i in num if i['sum']>30]
        return big_30

    def community_num(self):
        num = self.set.group(['community'], None, {'sum': 0}, self.num_func)
        return num

    def find(self, **kwargs):
        content = self.set.find(kwargs)
        data = []
        for i in content:
            data.append(i)
        return data


housingDB = MongoClient('fangyuan', 'housing')

