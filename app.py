from flask import Flask
from flask import render_template
from apis.api import api
from tool.jsonclass import JSONEncoder
app = Flask(__name__)

# JSON 自定义类
app.json_encoder = JSONEncoder

# json返回 显示中文
app.config['JSON_AS_ASCII'] = False

app.register_blueprint(api, url_prefix='/api')


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=7000,
        debug=True
    )