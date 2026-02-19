import os
import shutil

import setuptools

os.system('git clean -dfx')

package_folder = os.path.join(os.path.dirname(__file__), 'pvzebrademo')
os.mkdir(package_folder)

shutil.copy(os.path.join(os.path.dirname(__file__), '../../LICENSE'), package_folder)

shutil.copy(
    os.path.join(os.path.dirname(__file__), 'zebra_demo.py'),
    os.path.join(package_folder, 'zebra_demo.py'))

with open(os.path.join(os.path.dirname(__file__), 'MANIFEST.in'), 'w') as f:
    f.write('include pvzebrademo/LICENSE\n')
    f.write('include pvzebrademo/zebra_demo.py\n')

with open(os.path.join(os.path.dirname(__file__), 'README.md'), 'r') as f:
    long_description = f.read()

with open(os.path.join(os.path.dirname(__file__), "requirements.txt"), "r") as f:
    dependencies = f.read().strip().splitlines()

setuptools.setup(
    name="pvzebrademo",
    version="1.0.0",
    author="Picovoice",
    author_email="hello@picovoice.ai",
    description="Zebra Text Translation engine demo",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Picovoice/zebra",
    packages=["pvzebrademo"],
    install_requires=dependencies,
    include_package_data=True,
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Topic :: Text Processing :: Linguistic"
    ],
    entry_points=dict(
        console_scripts=[
            'zebra_demo=pvzebrademo.zebra_demo:main',
        ],
    ),
    python_requires='>=3.9',
    keywords="Translation, Text Tranlsation, Language Translation",
)
