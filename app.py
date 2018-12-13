from flask import Flask,jsonify,request
from flask import render_template
from db import housingDB
from tool.jsonclass import JSONEncoder
app = Flask(__name__)
#JSON 自定义类
app.json_encoder = JSONEncoder
#json返回 显示中文
app.config['JSON_AS_ASCII'] = False


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/district')
def district():
    num = housingDB.district_num()
    return jsonify(num)


@app.route('/api/position')
def position():
    num = housingDB.position_num()
    return jsonify(num)


@app.route('/api/getData')
def getData():
    community = request.args.get('community')
    data = housingDB.find(community=community)
    return jsonify(data)


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=7000,
        debug=True
    )