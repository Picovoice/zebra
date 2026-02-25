if [ ! -d "./zebra-test-app/src/androidTest/assets/test_resources/model_files" ]
then
    echo "Creating test model files directory..."
    mkdir -p ./zebra-test-app/src/androidTest/assets/test_resources/model_files
fi

echo "Copying zebra model files ..."
cp ../../../lib/common/*.pv ./zebra-test-app/src/androidTest/assets/test_resources/model_files

echo "Copying test data file..."
cp ../../../resources/.test/test_data.json ./zebra-test-app/src/androidTest/assets/test_resources
