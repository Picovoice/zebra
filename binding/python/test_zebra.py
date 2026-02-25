#
#    Copyright 2026 Picovoice Inc.
#
#    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
#    file accompanying this source.
#
#    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
#    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
#    specific language governing permissions and limitations under the License.
#

import os
import sys
import unittest
from typing import *

from parameterized import parameterized

from _util import *
from _zebra import *
from test_util import *

translation_tests = load_test_data()


class ZebraTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._access_key = sys.argv[1]
        cls._device = sys.argv[2]

    def test_invalid_access_key(self):
        with self.assertRaises(ZebraInvalidArgumentError):
            Zebra(
                access_key="invalid",
                model_path=get_model_path_by_language("../..", "en", "fr"),
                device=self._device,
                library_path=default_library_path("../../"),
            )

    def test_invalid_model_path(self):
        with self.assertRaises(ZebraIOError):
            Zebra(
                access_key=self._access_key,
                model_path="invalid",
                device=self._device,
                library_path=default_library_path("../../"))

    def test_invalid_device(self):
        with self.assertRaises(ZebraInvalidArgumentError):
            Zebra(
                access_key=self._access_key,
                model_path=get_model_path_by_language("../..", "en", "fr"),
                device="invalid",
                library_path=default_library_path("../../"))

    def test_invalid_library_path(self):
        with self.assertRaises(ZebraIOError):
            Zebra(
                access_key=self._access_key,
                model_path=get_model_path_by_language("../..", "en", "fr"),
                device=self._device,
                library_path="invalid")

    def test_version(self):
        o = Zebra(
            access_key=self._access_key,
            model_path=get_model_path_by_language("../..", "en", "fr"),
            device=self._device,
            library_path=default_library_path("../../"),
        )
        self.assertIsInstance(o.version, str)
        self.assertGreater(len(o.version), 0)
        o.delete()

    def test_empty_text(self):
        o = Zebra(
            access_key=self._access_key,
            model_path=get_model_path_by_language("../..", "en", "fr"),
            device=self._device,
            library_path=default_library_path("../../"),
        )
        with self.assertRaises(ZebraInvalidArgumentError):
            o.translate("")

        o.delete()

    def test_max_character_limit(self):
        o = Zebra(
            access_key=self._access_key,
            model_path=get_model_path_by_language("../..", "en", "fr"),
            device=self._device,
            library_path=default_library_path("../../"),
        )
        self.assertIsInstance(o.max_character_limit, int)
        self.assertGreater(o.max_character_limit, 0)

        with self.assertRaises(ZebraInvalidArgumentError):
            o.translate(" " * (o.max_character_limit + 1))

        o.delete()

    @parameterized.expand(translation_tests)
    def test_zebra_translate(self, source, text, target, translation):
        o = None

        try:
            o = Zebra(
                access_key=self._access_key,
                model_path=get_model_path_by_language("../..", source, target),
                device=self._device,
                library_path=default_library_path("../../"),
            )

            res = o.translate(text)
            self.assertEqual(res, translation)
        finally:
            if o is not None:
                o.delete()

    def test_message_stack(self):
        relative_path = "../.."

        error = None
        try:
            z = Zebra(
                access_key="invalid",
                model_path=get_model_path_by_language(relative_path, "en", "fr"),
                device=self._device,
                library_path=default_library_path(relative_path),
            )
            self.assertIsNone(z)
        except ZebraError as e:
            error = e.message_stack

        self.assertIsNotNone(error)
        self.assertGreater(len(error), 0)

        try:
            z = Zebra(
                access_key="invalid",
                model_path=get_model_path_by_language(relative_path, "en", "fr"),
                device=self._device,
                library_path=default_library_path(relative_path),
            )
            self.assertIsNone(z)
        except ZebraError as e:
            self.assertEqual(len(error), len(e.message_stack))
            self.assertListEqual(list(error), list(e.message_stack))

    def test_process_message_stack(self):
        relative_path = "../.."

        z = Zebra(
            access_key=self._access_key,
            model_path=get_model_path_by_language(relative_path, "en", "fr"),
            device=self._device,
            library_path=default_library_path(relative_path),
        )

        address = z._handle
        z._handle = None
        try:
            res = z.translate("Hello my name is")
            self.assertEqual(res, 100)
        except ZebraError as e:
            self.assertGreater(len(e.message_stack), 0)
            self.assertLess(len(e.message_stack), 8)
        finally:
            z._handle = address
            z.delete()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: %s ${ACCESS_KEY} ${DEVICE}" % sys.argv[0])
        exit(1)

    unittest.main(argv=sys.argv[:1])
