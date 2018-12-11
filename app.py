from flask import Flask,jsonify
from flask import render_template
from db import housingDB
app = Flask(__name__)


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

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=7000,
        debug=True )