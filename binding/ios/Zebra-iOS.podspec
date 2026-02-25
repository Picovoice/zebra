Pod::Spec.new do |s|
    s.name = 'Zebra-iOS'
    s.module_name = 'Zebra'
    s.version = '1.0.0'
    s.license = {:type => 'Apache 2.0'}
    s.summary = 'iOS binding for Picovoice\'s Zebra Translate.'
    s.description =
    <<-DESC
    Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

    Zebra is a lightweight, on-device neural machine translation engine. Zebra is:
    - Private; All processing runs locally.
    - Cross-Platform:
        - Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64)
        - Android and iOS
        - Chrome, Safari, Firefox, and Edge
        - Raspberry Pi (3, 4, 5)
    DESC
    s.homepage = 'https://github.com/Picovoice/zebra/tree/main/binding/ios'
    s.author = { 'Picovoice' => 'hello@picovoice.ai' }
    s.source = { :git => "https://github.com/Picovoice/zebra.git", :tag => s.version.to_s }
    s.ios.deployment_target = '16.0'
    s.swift_version = '5.0'
    s.vendored_frameworks = 'lib/ios/PvZebra.xcframework'
    s.source_files = 'binding/ios/*.{swift}'
    s.exclude_files = 'binding/ios/ZebraAppTest/**'
  end
