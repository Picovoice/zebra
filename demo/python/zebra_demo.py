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

import argparse
import os

from pvzebra import create, available_devices, ZebraActivationLimitError


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--access_key',
        help='AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)')
    parser.add_argument(
        '--model_path',
        help='Absolute path to Zebra model (`.pv`). The model file sets the source and target translation languages.')
    parser.add_argument(
        '--library_path',
        help='Absolute path to dynamic library. Default: using the library provided by `pvzebra`')
    parser.add_argument(
        '--device',
        help='Device to run inference on (`best`, `cpu:{num_threads}` or `gpu:{gpu_index}`). '
             'Default: automatically selects best device for `pvzebra`')
    parser.add_argument(
        '--text',
        help='Text to translate')
    parser.add_argument(
        '--show_inference_devices',
        action='store_true',
        help='Show the list of available devices for Zebra inference and exit')
    args = parser.parse_args()

    if args.show_inference_devices:
        print('\n'.join(available_devices(library_path=args.library_path)))
        return

    if args.access_key is None:
        raise ValueError('Missing required argument --access_key')

    if args.model_path is None:
        raise ValueError('Missing required argument --model_path')

    if args.text is None:
        raise ValueError('Missing required argument --text')

    zebra = create(
        access_key=args.access_key,
        model_path=args.model_path,
        device=args.device,
        library_path=args.library_path)

    try:
        translation = zebra.translate(args.text)
        print(f"Translation: {translation}")
    except ZebraActivationLimitError:
        print('AccessKey has reached its processing limit.')


if __name__ == '__main__':
    main()
