#
# Copyright 2026 Picovoice Inc.
#
# You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
# file accompanying this source.
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#

import json
import os
import struct
import wave
from typing import *

from _zebra import *


def load_test_data() -> List[Tuple[str, str, str, str]]:
    data_file_path = os.path.join(os.path.dirname(__file__), "../../resources/.test/test_data.json")
    with open(data_file_path, encoding="utf8") as data_file:
        json_test_data = data_file.read()
    test_data = json.loads(json_test_data)['tests']

    translation_tests = list()
    for t in test_data['translation_tests']:
        for k, v in t['translations'].items():
            translation_tests.append((t['source'], t['text'], k, v))

    return translation_tests


def get_model_path_by_language(relative, source, target):
    return os.path.join(os.path.dirname(__file__), relative, f'lib/common/zebra_params_{source}_{target}.pv')


__all__ = [
    'load_test_data',
    'get_model_path_by_language',
]
