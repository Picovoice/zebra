import os
import pathlib
from collections import namedtuple
from ctypes import *
from enum import Enum
from typing import *


class ZebraError(Exception):
    def __init__(self, message: str = "", message_stack: Sequence[str] = None):
        super().__init__(message)

        self._message = message
        self._message_stack = list() if message_stack is None else message_stack

    def __str__(self):
        message = self._message
        if len(self._message_stack) > 0:
            message += ":"
            for i in range(len(self._message_stack)):
                message += "\n  [%d] %s" % (i, self._message_stack[i])
        return message

    @property
    def message(self) -> str:
        return self._message

    @property
    def message_stack(self) -> Sequence[str]:
        return self._message_stack


class ZebraMemoryError(ZebraError):
    pass


class ZebraIOError(ZebraError):
    pass


class ZebraInvalidArgumentError(ZebraError):
    pass


class ZebraStopIterationError(ZebraError):
    pass


class ZebraKeyError(ZebraError):
    pass


class ZebraInvalidStateError(ZebraError):
    pass


class ZebraRuntimeError(ZebraError):
    pass


class ZebraActivationError(ZebraError):
    pass


class ZebraActivationLimitError(ZebraError):
    pass


class ZebraActivationThrottledError(ZebraError):
    pass


class ZebraActivationRefusedError(ZebraError):
    pass


class Zebra(object):
    """
    Python binding for Zebra Text Translation engine.
    """

    class PicovoiceStatuses(Enum):
        SUCCESS = 0
        OUT_OF_MEMORY = 1
        IO_ERROR = 2
        INVALID_ARGUMENT = 3
        STOP_ITERATION = 4
        KEY_ERROR = 5
        INVALID_STATE = 6
        RUNTIME_ERROR = 7
        ACTIVATION_ERROR = 8
        ACTIVATION_LIMIT_REACHED = 9
        ACTIVATION_THROTTLED = 10
        ACTIVATION_REFUSED = 11

    _PICOVOICE_STATUS_TO_EXCEPTION = {
        PicovoiceStatuses.OUT_OF_MEMORY: ZebraMemoryError,
        PicovoiceStatuses.IO_ERROR: ZebraIOError,
        PicovoiceStatuses.INVALID_ARGUMENT: ZebraInvalidArgumentError,
        PicovoiceStatuses.STOP_ITERATION: ZebraStopIterationError,
        PicovoiceStatuses.KEY_ERROR: ZebraKeyError,
        PicovoiceStatuses.INVALID_STATE: ZebraInvalidStateError,
        PicovoiceStatuses.RUNTIME_ERROR: ZebraRuntimeError,
        PicovoiceStatuses.ACTIVATION_ERROR: ZebraActivationError,
        PicovoiceStatuses.ACTIVATION_LIMIT_REACHED: ZebraActivationLimitError,
        PicovoiceStatuses.ACTIVATION_THROTTLED: ZebraActivationThrottledError,
        PicovoiceStatuses.ACTIVATION_REFUSED: ZebraActivationRefusedError,
    }

    class CZebra(Structure):
        pass

    def __init__(self, access_key: str, model_path: str, device: str, library_path: str) -> None:
        """
        Constructor.

        :param access_key: AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
        :param model_path: Absolute path to the file containing model parameters.
        :param device: String representation of the device (e.g., CPU or GPU) to use. If set to `best`, the most
        suitable device is selected automatically. If set to `gpu`, the engine uses the first available GPU device.
        To select a specific GPU device, set this argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}` is the index
        of the target GPU. If set to `cpu`, the engine will run on the CPU with the default number of threads.
        To specify the number of threads, set this argument to `cpu:${NUM_THREADS}`, where `${NUM_THREADS}`
        is the desired number of threads.
        :param library_path: Absolute path to Zebra's dynamic library.
        """

        if not isinstance(access_key, str) or len(access_key) == 0:
            raise ZebraInvalidArgumentError("`access_key` should be a non-empty string.")

        if not isinstance(model_path, str) or len(model_path) == 0:
            raise ZebraInvalidArgumentError("`model_path` should be a non-empty string.")

        if not os.path.exists(model_path):
            raise ZebraIOError("Could not find model file at `%s`." % model_path)

        if not isinstance(device, str) or len(device) == 0:
            raise ZebraInvalidArgumentError("`device` should be a non-empty string.")

        if not os.path.exists(library_path):
            raise ZebraIOError("Could not find Zebra's dynamic library at `%s`." % library_path)

        library = cdll.LoadLibrary(library_path)

        set_sdk_func = library.pv_set_sdk
        set_sdk_func.argtypes = [c_char_p]
        set_sdk_func.restype = None

        set_sdk_func("python".encode("utf-8"))

        self._get_error_stack_func = library.pv_get_error_stack
        self._get_error_stack_func.argtypes = [POINTER(POINTER(c_char_p)), POINTER(c_int)]
        self._get_error_stack_func.restype = self.PicovoiceStatuses

        self._free_error_stack_func = library.pv_free_error_stack
        self._free_error_stack_func.argtypes = [POINTER(c_char_p)]
        self._free_error_stack_func.restype = None

        init_func = library.pv_zebra_init
        init_func.argtypes = [c_char_p, c_char_p, c_char_p, POINTER(POINTER(self.CZebra))]
        init_func.restype = self.PicovoiceStatuses

        self._handle = POINTER(self.CZebra)()

        status = init_func(access_key.encode(), model_path.encode(), device.encode(), byref(self._handle))
        if status is not self.PicovoiceStatuses.SUCCESS:
            raise self._PICOVOICE_STATUS_TO_EXCEPTION[status](
                message="Initialization failed", message_stack=self._get_error_stack()
            )

        max_character_limit_func = library.pv_zebra_max_character_limit
        max_character_limit_func.argtypes = [POINTER(self.CZebra), POINTER(c_int32)]
        max_character_limit_func.restype = self.PicovoiceStatuses

        c_max_character_limit = c_int32()
        status = max_character_limit_func(self._handle, byref(c_max_character_limit))
        if status is not self.PicovoiceStatuses.SUCCESS:
            raise self._PICOVOICE_STATUS_TO_EXCEPTION[status](
                message="Failed to get max character limit", message_stack=self._get_error_stack()
            )
        self._max_character_limit = c_max_character_limit.value

        self._delete_func = library.pv_zebra_delete
        self._delete_func.argtypes = [POINTER(self.CZebra)]
        self._delete_func.restype = None

        self._translate_func = library.pv_zebra_translate
        self._translate_func.argtypes = [
            POINTER(self.CZebra),
            c_char_p,
            POINTER(c_char_p),
        ]
        self._translate_func.restype = self.PicovoiceStatuses

        self._translation_delete_func = library.pv_zebra_translation_delete
        self._translation_delete_func.argtypes = [POINTER(self.CZebra), c_char_p]
        self._translation_delete_func.restype = None

        version_func = library.pv_zebra_version
        version_func.argtypes = []
        version_func.restype = c_char_p
        self._version = version_func().decode("utf-8")

    def translate(self, text: str) -> str:
        """
        Translates text. The maximum number of characters that can be translated at once
        is given by `.max_character_limit`.

        :param text: Text to translate.
        :return: Translated text.
        """

        if len(text) == 0:
            raise ZebraInvalidArgumentError()

        if len(text) > self.max_character_limit:
            raise ZebraInvalidArgumentError("Maximum character limit exceeded.")

        c_translation = c_char_p()
        status = self._translate_func(self._handle, text.encode(), byref(c_translation))
        if status is not self.PicovoiceStatuses.SUCCESS:
            raise self._PICOVOICE_STATUS_TO_EXCEPTION[status](
                message="Translate failed", message_stack=self._get_error_stack()
            )

        translation = c_translation.value.decode()
        self._translation_delete_func(self._handle, c_translation)

        return translation

    def delete(self) -> None:
        """Releases resources acquired by Zebra."""

        self._delete_func(self._handle)

    @property
    def version(self) -> str:
        """Version."""

        return self._version

    @property
    def max_character_limit(self) -> int:
        """Gets the maximum number of characters that can be translated at once by `.translate`."""

        return self._max_character_limit

    def _get_error_stack(self) -> Sequence[str]:
        message_stack_ref = POINTER(c_char_p)()
        message_stack_depth = c_int()
        status = self._get_error_stack_func(byref(message_stack_ref), byref(message_stack_depth))
        if status is not self.PicovoiceStatuses.SUCCESS:
            raise self._PICOVOICE_STATUS_TO_EXCEPTION[status](message="Unable to get Zebra error state")

        message_stack = list()
        for i in range(message_stack_depth.value):
            message_stack.append(message_stack_ref[i].decode("utf-8"))

        self._free_error_stack_func(message_stack_ref)

        return message_stack


def list_hardware_devices(library_path: str) -> Sequence[str]:
    dll_dir_obj = None
    if hasattr(os, "add_dll_directory"):
        dll_dir_obj = os.add_dll_directory(os.path.dirname(library_path))

    library = cdll.LoadLibrary(library_path)

    if dll_dir_obj is not None:
        dll_dir_obj.close()

    list_hardware_devices_func = library.pv_zebra_list_hardware_devices
    list_hardware_devices_func.argtypes = [POINTER(POINTER(c_char_p)), POINTER(c_int32)]
    list_hardware_devices_func.restype = Zebra.PicovoiceStatuses
    c_hardware_devices = POINTER(c_char_p)()
    c_num_hardware_devices = c_int32()
    status = list_hardware_devices_func(byref(c_hardware_devices), byref(c_num_hardware_devices))
    if status is not Zebra.PicovoiceStatuses.SUCCESS:
        raise _PICOVOICE_STATUS_TO_EXCEPTION[status](message='`pv_zebra_list_hardware_devices` failed.')
    res = [c_hardware_devices[i].decode() for i in range(c_num_hardware_devices.value)]

    free_hardware_devices_func = library.pv_zebra_free_hardware_devices
    free_hardware_devices_func.argtypes = [POINTER(c_char_p), c_int32]
    free_hardware_devices_func.restype = None
    free_hardware_devices_func(c_hardware_devices, c_num_hardware_devices.value)

    return res


__all__ = [
    "Zebra",
    "ZebraActivationError",
    "ZebraActivationLimitError",
    "ZebraActivationRefusedError",
    "ZebraActivationThrottledError",
    "ZebraError",
    "ZebraIOError",
    "ZebraInvalidArgumentError",
    "ZebraInvalidStateError",
    "ZebraKeyError",
    "ZebraMemoryError",
    "ZebraRuntimeError",
    "ZebraStopIterationError",
    'list_hardware_devices',
]
