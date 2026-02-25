#!/bin/sh

mkdir -p "${SRCROOT}/models/"

rm "${SRCROOT}/models/"*

if [ $1 != 'en_fr' ];
then
    cp "${SRCROOT}/../../../lib/common/zebra_params_$1.pv" "${SRCROOT}/models/"
fi
