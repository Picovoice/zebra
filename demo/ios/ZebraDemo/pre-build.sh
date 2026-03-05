#!/bin/sh

mkdir -p "${SRCROOT}/models/"

rm "${SRCROOT}/models/"*
cp "${SRCROOT}/../../../lib/common/zebra_params_$1.pv" "${SRCROOT}/models/"
