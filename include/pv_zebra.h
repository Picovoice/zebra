/*
    Copyright 2025-2026 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#ifndef PV_ZEBRA_H
#define PV_ZEBRA_H

#include <stdint.h>

#include "picovoice.h"

#ifdef __cplusplus

extern "C" {

#endif


/**
 * Forward declaration for Zebra translation engine.
 */
typedef struct pv_zebra pv_zebra_t;

/**
 * Constructor.
 *
 * @param access_key AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
 * @param model_path Absolute path to the file containing model parameters.
 * @param device String representation of the device (e.g., CPU or GPU) to use for translation. If set to `best`, the most
 * suitable device is selected automatically. If set to `gpu`, the engine uses the first available GPU device.
 * To select a specific GPU device, set this argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}` is the index of the
 * target GPU. If set to `cpu`, the engine will run on the CPU with the default number of threads. To specify the
 * number of threads, set this argument to `cpu:${NUM_THREADS}`, where `${NUM_THREADS}` is the desired number of threads.
 * @param[out] object Constructed instance of Zebra.
 * @return Status code. Returns `PV_STATUS_INVALID_ARGUMENT` or `PV_STATUS_OUT_OF_MEMORY`,
 * `PV_STATUS_RUNTIME_ERROR`, `PV_STATUS_ACTIVATION_ERROR`, `PV_STATUS_ACTIVATION_LIMIT_REACHED`,
 * `PV_STATUS_ACTIVATION_THROTTLED`, or `PV_STATUS_ACTIVATION_REFUSED` on failure.
 */
PV_API pv_status_t pv_zebra_init(
        const char *access_key,
        const char *model_path,
        const char *device,
        pv_zebra_t **object);

/**
 * Destructor.
 *
 * @param object The Zebra object.
 */
PV_API void pv_zebra_delete(pv_zebra_t *object);

/**
 * Gets the maximum number of characters that can be translated at once.
 *
 * @param object The Zebra object
 * @param[out] max_character_limit Maximum number of characters that can be translated at once.
 * @return Status code. Returns `PV_STATUS_INVALID_ARGUMENT` on failure.
 */
PV_API pv_status_t pv_zebra_max_character_limit(const pv_zebra_t *object, int32_t *max_character_limit);

/**
 * Translates text.
 *
 * @param object The Zebra object
 * @param text Text to translate.
 * @param[out] translation Translated text.
 * @return Status code. Returns `PV_STATUS_INVALID_ARGUMENT` or `PV_STATUS_OUT_OF_MEMORY`,
 * `PV_STATUS_RUNTIME_ERROR`, `PV_STATUS_ACTIVATION_ERROR`, `PV_STATUS_ACTIVATION_LIMIT_REACHED`,
 * `PV_STATUS_ACTIVATION_THROTTLED`, or `PV_STATUS_ACTIVATION_REFUSED` on failure.
 */
PV_API pv_status_t pv_zebra_translate(
        pv_zebra_t *object,
        const char *text,
        char **translation);

/**
 * Deletes translation returned from `pv_zebra_translate()`.
 *
 * @param object The Zebra object
 * @param translation translation string returned from `pv_zebra_translate()`
 */
PV_API void pv_zebra_translation_delete(
        pv_zebra_t *object,
        char *translation);

/**
 * Resets the internal state of the Zebra object.
 *
 * @param object The Zebra object.
 * @return Returns `PV_STATUS_INVALID_ARGUMENT` on failure.
 */
PV_API pv_status_t pv_zebra_reset(pv_zebra_t *object);

/**
 * Getter for version.
 *
 * @return Version.
 */
PV_API const char *pv_zebra_version(void);

/**
 * Gets a list of hardware devices that can be specified when calling `pv_zebra_init`
 *
 * @param[out] hardware_devices Array of available hardware devices. Devices are NULL terminated strings.
 *                              The array must be freed using `pv_zebra_free_hardware_devices`.
 * @param[out] num_hardware_devices The number of devices in the `hardware_devices` array.
 * @return Status code. Returns `PV_STATUS_OUT_OF_MEMORY`, `PV_STATUS_INVALID_ARGUMENT`, `PV_STATUS_INVALID_STATE`,
 * `PV_STATUS_RUNTIME_ERROR`, `PV_STATUS_ACTIVATION_ERROR`, `PV_STATUS_ACTIVATION_LIMIT_REACHED`,
 * `PV_STATUS_ACTIVATION_THROTTLED`, or `PV_STATUS_ACTIVATION_REFUSED` on failure.
 */
PV_API pv_status_t pv_zebra_list_hardware_devices(
        char ***hardware_devices,
        int32_t *num_hardware_devices);

/**
 * Frees memory allocated by `pv_zebra_list_hardware_devices`.
 *
 * @param[out] hardware_devices Array of available hardware devices allocated by `pv_zebra_list_hardware_devices`.
 * @param[out] num_hardware_devices The number of devices in the `hardware_devices` array.
 */
PV_API void pv_zebra_free_hardware_devices(
        char **hardware_devices,
        int32_t num_hardware_devices);

#ifdef __cplusplus

}

#endif

#endif // PV_ZEBRA_H
