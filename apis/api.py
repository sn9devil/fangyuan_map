from flask import Blueprint, jsonify, request
from db import housingDB
api = Blueprint('api', __name__)


@api.route('/district')
def district():
    num = housingDB.district_num()
    return jsonify(num)


@api.route('/position')
def position():
    num = housingDB.position_num()
    return jsonify(num)


@api.route('/getData')
def getData():
    community = request.args.get('community')
    data = housingDB.find(community=community)
    return jsonify(data)
