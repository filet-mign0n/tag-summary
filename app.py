import os
import logging

from urllib.request import urlopen
from urllib.error import HTTPError, URLError

from flask import (
    Flask,
    request,
    jsonify,
    render_template,
    send_from_directory,
)

HOST = os.environ.get('APP_HOST', '0.0.0.0')
PORT = os.environ.get('APP_PORT', '8080')

logging.basicConfig(
    format='%(asctime)s %(message)s',
    level=logging.INFO,
    filename='app.log',
)

app = Flask(
    __name__,
    static_url_path='',
    template_folder='template'
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def get_static(path):
    return send_from_directory('static', path)

@app.route('/api', methods=['POST'])
def api():
    content = request.get_json()
    logging.debug('POST request content:', content)
    ret = get_html_from_url(content['url'])

    return jsonify(ret)

def get_html_from_url(url):
    ret = { 'html': '', 'error': '' }
    logging.info('fetch HTML for url: {}'.format(url))
    error_string = None
    try:
        with urlopen(url) as response:
            ret['html'] = response.read()\
                            .decode('utf-8', errors='ignore')
    except HTTPError as e:
        error_string = 'HTTP error: {}'.format(e.code)
        ret['error'] = error_string
    except (URLError, ValueError) as e:
        error_string = 'URL error: "{}"'.format(e)
    except Exception as e:
        error_string = 'Unforeseen error: "{}"'.format(e)
    finally:
        if error_string:
            ret['error'] = error_string
            logging.error(error_string)

    return ret

if __name__ == '__main__':
    app.run(host=HOST, port=int(PORT))

